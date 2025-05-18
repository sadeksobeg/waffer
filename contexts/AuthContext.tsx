import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock user types - replace with your actual API types
export type UserRole = 'customer' | 'merchant' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  points?: number;
  storeId?: string;
}

// Auth context types
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
};

// Create the context
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// User storage key
const USER_KEY = 'user-data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const userData = await AsyncStorage.getItem(USER_KEY);
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      // This is a mock implementation - replace with your actual API call
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for different roles - in real implementation, you'd get this from your backend
      let mockUser: User;
      
      if (email.includes('admin')) {
        mockUser = { id: '1', email, name: 'Admin User', role: 'admin' };
      } else if (email.includes('merchant')) {
        mockUser = { 
          id: '2', 
          email, 
          name: 'Merchant User', 
          role: 'merchant',
          storeId: 'store123'
        };
      } else {
        mockUser = { 
          id: '3', 
          email, 
          name: 'Customer User', 
          role: 'customer',
          points: 450
        };
      }
      
      // Set user and save to storage
      setUser(mockUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      // Navigate based on role
      if (mockUser.role === 'admin') {
        router.replace('/(admin)');
      } else if (mockUser.role === 'merchant') {
        router.replace('/(merchant)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (email: string, password: string, name: string, role: UserRole) => {
    try {
      // This is a mock implementation - replace with your actual API call
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create mock user
      const mockUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        email,
        name,
        role,
        points: role === 'customer' ? 100 : undefined,
        storeId: role === 'merchant' ? `store-${Math.random().toString(36).substring(2, 7)}` : undefined
      };
      
      // Set user and save to storage
      setUser(mockUser);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(mockUser));
      
      // Navigate based on role
      if (mockUser.role === 'admin') {
        router.replace('/(admin)');
      } else if (mockUser.role === 'merchant') {
        router.replace('/(merchant)');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // Clear user data
      setUser(null);
      await AsyncStorage.removeItem(USER_KEY);
      
      // Navigate to auth screen
      router.replace('/(auth)');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated: !!user, 
        login, 
        register, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);