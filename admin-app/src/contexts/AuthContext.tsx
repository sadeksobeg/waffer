import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { authService } from '@/services';
import type { User } from '@/services/authService';

export type UserRole = 'admin' | 'merchant' | 'support';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  switchUserRole: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
  switchUserRole: async () => {}
});

export const useAuth = () => useContext(AuthContext);

// Mock user data for development (will be removed in production)
const mockUserData: Record<UserRole, UserData> = {
  admin: {
    id: 'admin-user',
    email: 'admin@example.com',
    displayName: 'Admin User',
    role: 'admin',
    avatar: '',
  },
  merchant: {
    id: 'merchant-user',
    email: 'merchant@example.com',
    displayName: 'Merchant User',
    role: 'merchant',
    avatar: '',
  },
  support: {
    id: 'support-user',
    email: 'support@example.com',
    displayName: 'Support User',
    role: 'support',
    avatar: '',
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';

  useEffect(() => {
    // Always use mock admin user in development mode
    if (isDevelopment) {
      console.log('Using development mode with mock admin user');
      const mockUser: User = {
        id: 'admin-user',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        avatar: '',
      };

      setUser(mockUser);
      setUserData(mockUserData.admin);
      setLoading(false);
      return () => {};
    }

    // Normal authentication flow for production
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in
          // Get the user's custom claims (role)
          const idTokenResult = await firebaseUser.getIdTokenResult();
          const role = idTokenResult.claims.role || 'customer';

          // Get additional user data from Firestore
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();

            // Set user state
            const userProfile: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: userData.firstName || '',
              lastName: userData.lastName || '',
              role: role as string,
              avatar: userData.avatar || '',
            };

            setUser(userProfile);

            // Set userData state
            setUserData({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: userData.firstName && userData.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : firebaseUser.displayName || '',
              role: role as UserRole,
              avatar: userData.avatar || '',
            });
          } else {
            // User document doesn't exist in Firestore
            // Create a new user document
            const newUser = {
              email: firebaseUser.email,
              firstName: firebaseUser.displayName?.split(' ')[0] || '',
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
              role: 'customer',
              createdAt: new Date(),
              lastLoginAt: new Date(),
              isActive: true,
            };

            await setDoc(userDocRef, newUser);

            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              firstName: newUser.firstName,
              lastName: newUser.lastName,
              role: newUser.role,
              avatar: '',
            });

            setUserData({
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              role: newUser.role as UserRole,
              avatar: '',
            });
          }
        } else {
          // User is signed out
          setUser(null);
          setUserData(null);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Always use mock users in development mode
      if (isDevelopment) {
        // In development mode, check if the email matches one of our mock users
        if (email === 'admin@example.com' && password === 'password') {
          setUser({
            id: 'admin-user',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            avatar: '',
          });
          setUserData(mockUserData.admin);
          router.push('/dashboard');
          return;
        } else if (email === 'merchant@example.com' && password === 'password') {
          setUser({
            id: 'merchant-user',
            email: 'merchant@example.com',
            firstName: 'Merchant',
            lastName: 'User',
            role: 'merchant',
            avatar: '',
          });
          setUserData(mockUserData.merchant);
          router.push('/dashboard');
          return;
        } else if (email === 'support@example.com' && password === 'password') {
          setUser({
            id: 'support-user',
            email: 'support@example.com',
            firstName: 'Support',
            lastName: 'User',
            role: 'support',
            avatar: '',
          });
          setUserData(mockUserData.support);
          router.push('/dashboard');
          return;
        } else {
          // In development mode, allow any credentials
          console.log('Using default admin user for development');
          setUser({
            id: 'admin-user',
            email: email || 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            avatar: '',
          });
          setUserData(mockUserData.admin);
          router.push('/dashboard');
          return;
        }
      }

      // Normal authentication flow for production
      await signInWithEmailAndPassword(auth, email, password);

      // The onAuthStateChanged listener will handle updating the user state
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login failed:', error);

      // Provide more user-friendly error messages
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed login attempts. Please try again later');
      } else {
        throw new Error(error.message || 'Login failed');
      }
    }
  };

  const signOut = async () => {
    try {
      // Sign out from Firebase Authentication
      await firebaseSignOut(auth);

      // The onAuthStateChanged listener will handle clearing the user state
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const switchUserRole = async (role: UserRole): Promise<void> => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call a Firebase Function to update the user's role
      // This requires a custom Firebase Function that updates the user's custom claims
      await authService.switchRole(role);

      // Force token refresh to get the updated custom claims
      await auth.currentUser?.getIdToken(true);

      // Update local state
      if (user) {
        const updatedUser = {
          ...user,
          role: role,
        };

        setUser(updatedUser);

        if (userData) {
          setUserData({
            ...userData,
            role: role,
          });
        }
      }
    } catch (error) {
      console.error('Role switch failed:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signIn, signOut, switchUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};