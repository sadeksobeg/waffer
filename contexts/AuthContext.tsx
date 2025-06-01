import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use React Native Firebase types
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
type FirebaseUser = FirebaseAuthTypes.User;

// Import Firebase services dynamically to avoid initialization conflicts
let auth: any, firestore: any;
try {
  const firebaseConfig = require('../app/config/firebase');
  auth = firebaseConfig.auth;
  firestore = firebaseConfig.firestore;
} catch (error) {
  console.warn('Could not load Firebase config:', error);
}

// User types
export type UserRole = 'customer' | 'merchant' | 'admin';

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  role: UserRole;
  points?: number;
  storeId?: string;
  createdAt?: any;
  updatedAt?: any;
}

// Auth context types
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearError: () => void;
};

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  authError: null,
  clearError: () => {},
});

// User storage key for caching
const USER_ROLE_KEY = 'user-role-data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  // Fetch user data from Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      // Get user document from Firestore using React Native Firebase API
      const userDoc = await firestore().collection('users').doc(firebaseUser.uid).get();

      if (userDoc.exists) {
        // User exists in Firestore
        const userData = userDoc.data();

        // Create user object
        const user: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || userData?.displayName,
          role: userData?.role || 'customer',
          points: userData?.points,
          storeId: userData?.storeId,
          createdAt: userData?.createdAt,
          updatedAt: userData?.updatedAt
        };

        // Cache user role for offline access
        await AsyncStorage.setItem(USER_ROLE_KEY, JSON.stringify({
          role: user.role,
          points: user.points,
          storeId: user.storeId
        }));

        return user;
      } else {
        // User doesn't exist in Firestore yet
        // Create a basic user document
        const newUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName,
          role: 'customer',
          points: 0
        };

        // Create user document in Firestore using React Native Firebase API
        await firestore().collection('users').doc(firebaseUser.uid).set({
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          role: 'customer',
          points: 0,
          createdAt: firestore.FieldValue.serverTimestamp()
        });

        return newUser;
      }
    } catch (error) {
      console.error('Error fetching user data:', error);

      // Fallback to basic user info if Firestore is unavailable
      return {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        role: 'customer'
      };
    }
  };

  // Initialize auth state on mount
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener using React Native Firebase API
        unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
          try {
            if (firebaseUser) {
              // User is signed in
              const userData = await fetchUserData(firebaseUser);
              setUser(userData);
            } else {
              // User is signed out
              setUser(null);
              await AsyncStorage.removeItem(USER_ROLE_KEY);
            }
          } catch (error) {
            console.error('Auth state change error:', error);
            // Set user to null on error but don't keep loading
            setUser(null);
          } finally {
            // Always set loading to false
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Firebase initialization error:', error);
        // If Firebase fails to initialize, set loading to false and user to null
        setUser(null);
        setIsLoading(false);
      }
    };

    // Add a timeout to ensure loading doesn't hang indefinitely
    const timeoutId = setTimeout(() => {
      console.warn('Auth initialization timeout - setting loading to false');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    initializeAuth();

    // Cleanup subscription and timeout
    return () => {
      clearTimeout(timeoutId);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Sign in with Firebase using React Native Firebase API
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const userData = await fetchUserData(userCredential.user);

      // Navigate based on role
      if (userData?.role === 'admin') {
        router.replace('/(admin)');
      } else if (userData?.role === 'merchant') {
        router.replace('/(merchant)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Login failed:', error);

      // Handle specific Firebase auth errors
      if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setAuthError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError('Too many failed login attempts. Please try again later');
      } else {
        setAuthError('Login failed. Please try again.');
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      setIsLoading(true);
      setAuthError(null);

      // Create user with Firebase using React Native Firebase API
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);

      // Update profile with display name
      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: name
        });
      }

      // Create user document in Firestore using React Native Firebase API
      await firestore().collection('users').doc(userCredential.user.uid).set({
        email,
        displayName: name,
        role,
        points: role === 'customer' ? 100 : 0,
        storeId: role === 'merchant' ? `store-${Math.random().toString(36).substring(2, 7)}` : null,
        createdAt: firestore.FieldValue.serverTimestamp()
      });

      // Fetch complete user data
      const userData = await fetchUserData(userCredential.user);

      // Navigate based on role
      if (userData?.role === 'admin') {
        router.replace('/(admin)');
      } else if (userData?.role === 'merchant') {
        router.replace('/(merchant)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);

      // Handle specific Firebase auth errors
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Email is already in use');
      } else if (error.code === 'auth/invalid-email') {
        setAuthError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('Password is too weak');
      } else {
        setAuthError('Registration failed. Please try again.');
      }

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);

      // Sign out from Firebase using React Native Firebase API
      await auth().signOut();

      // Clear cached data
      await AsyncStorage.removeItem(USER_ROLE_KEY);

      // Navigate to auth screen
      router.replace('/(auth)');
    } catch (error) {
      console.error('Logout failed:', error);
      setAuthError('Logout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        authError,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);