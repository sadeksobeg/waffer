import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  userRole: string | null;
  loading: boolean;
  authError: string | null;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<UserCredential>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch user role from Firestore
  const fetchUserRole = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUserRole(userDoc.data().role || 'user');
      } else {
        setUserRole('user'); // Default role
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user'); // Default role on error
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        await fetchUserRole(user.uid);
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      setAuthError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Check if user is an admin
      await fetchUserRole(userCredential.user.uid);

      return userCredential.user;
    } catch (error: any) {
      let errorMessage = 'Failed to sign in';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Please try again later';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled';
      }

      setAuthError(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, displayName: string): Promise<UserCredential> => {
    try {
      setAuthError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile with display name
      await updateProfile(userCredential.user, { displayName });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        displayName,
        role: 'user', // Default role for new users
        createdAt: serverTimestamp(),
      });

      return userCredential;
    } catch (error: any) {
      let errorMessage = 'Failed to create account';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }

      setAuthError(errorMessage);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setAuthError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      let errorMessage = 'Failed to send password reset email';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }

      setAuthError(errorMessage);
      throw error;
    }
  };

  const updateUserProfile = async (displayName: string): Promise<void> => {
    try {
      setAuthError(null);
      if (currentUser) {
        await updateProfile(currentUser, { displayName });

        // Update user document in Firestore
        await setDoc(doc(db, 'users', currentUser.uid), {
          displayName,
          updatedAt: serverTimestamp(),
        }, { merge: true });

        // Force refresh of the current user
        setCurrentUser({ ...currentUser, displayName });
      }
    } catch (error: any) {
      setAuthError('Failed to update profile');
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setAuthError(null);
      await firebaseSignOut(auth);
    } catch (error: any) {
      setAuthError('Failed to sign out');
      throw error;
    }
  };

  const clearError = () => {
    setAuthError(null);
  };

  const value = {
    currentUser,
    userRole,
    loading,
    authError,
    signIn,
    signOut,
    signUp,
    resetPassword,
    updateUserProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
