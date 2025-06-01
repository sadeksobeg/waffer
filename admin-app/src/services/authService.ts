import { api } from './apiClient';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  displayName?: string;
}

const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Get the user's custom claims (role)
      const idTokenResult = await firebaseUser.getIdTokenResult();
      const role = (idTokenResult.claims.role as string) || 'customer';

      // Get additional user data from Firestore
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      let userData: any = {};

      if (userDoc.exists()) {
        userData = userDoc.data();

        // Update lastLoginAt
        await updateDoc(userDocRef, {
          lastLoginAt: serverTimestamp()
        });
      } else {
        // Create user document if it doesn't exist
        userData = {
          email: firebaseUser.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || '',
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
          role: 'customer',
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          isActive: true
        };

        await setDoc(userDocRef, userData);
      }

      // Get the token
      const token = await firebaseUser.getIdToken();

      // Return the response
      return {
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          role: role,
          avatar: userData.avatar || '',
        },
        token,
        refreshToken: firebaseUser.refreshToken
      };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Update profile
      await updateProfile(firebaseUser, {
        displayName: `${credentials.firstName} ${credentials.lastName}`
      });

      // Create user document in Firestore
      const userData = {
        email: credentials.email,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        role: 'customer',
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
        isActive: true
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Get the token
      const token = await firebaseUser.getIdToken();

      // Return the response
      return {
        user: {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: credentials.firstName,
          lastName: credentials.lastName,
          role: 'customer',
          avatar: '',
        },
        token,
        refreshToken: firebaseUser.refreshToken
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  /**
   * Get the current user profile
   */
  getCurrentUser: async (): Promise<User> => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      throw new Error('User not authenticated');
    }

    // Get the user's custom claims (role)
    const idTokenResult = await firebaseUser.getIdTokenResult();
    const role = (idTokenResult.claims.role as string) || 'customer';

    // Get additional user data from Firestore
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('User document not found');
    }

    const userData = userDoc.data();

    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      role: role,
      avatar: userData.avatar || '',
    };
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!auth.currentUser;
  },

  /**
   * Change user password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    const user = auth.currentUser;

    if (!user || !user.email) {
      throw new Error('User not authenticated');
    }

    // Re-authenticate the user
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update the password
    await updatePassword(user, newPassword);
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    // Firebase handles this differently - we need to use the action code
    // This is typically handled by a separate page that Firebase redirects to
    return api.post('/auth/reset-password', { token, newPassword });
  },

  /**
   * Switch user role (for users with multiple roles)
   */
  switchRole: async (role: string): Promise<User> => {
    // This requires a custom Firebase Function to update the user's custom claims
    const response = await api.post<{ user: User }>('/auth/switch-role', { role });
    return response.user;
  },

  /**
   * Update user profile
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const user = auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Update Firestore document
    const userDocRef = doc(db, 'users', user.uid);

    await updateDoc(userDocRef, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      avatar: userData.avatar,
      updatedAt: serverTimestamp()
    });

    // Update Firebase Auth profile if name changed
    if (userData.firstName && userData.lastName) {
      await updateProfile(user, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });
    }

    // Get updated user data
    return authService.getCurrentUser();
  }
};

export default authService;
