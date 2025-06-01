import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

// User interface
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
  photoURL?: string;
  phoneNumber?: string;
}

// User input interface for creating/updating users
export interface UserInput {
  email: string;
  displayName: string;
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  photoURL?: string;
  phoneNumber?: string;
}

// Pagination options
export interface PaginationOptions {
  pageSize: number;
  startAfter?: DocumentSnapshot;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

// Filter options
export interface FilterOptions {
  role?: string;
  status?: 'active' | 'inactive' | 'suspended';
  searchTerm?: string;
}

/**
 * Get a user by ID
 * @param userId User ID
 * @returns User object or null if not found
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return null;
    }
    
    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Get users with pagination and filtering
 * @param paginationOptions Pagination options
 * @param filterOptions Filter options
 * @returns Array of users and the last document for pagination
 */
export const getUsers = async (
  paginationOptions: PaginationOptions,
  filterOptions: FilterOptions = {}
): Promise<{ users: User[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const { pageSize = 10, startAfter, orderByField = 'createdAt', orderDirection = 'desc' } = paginationOptions;
    const { role, status, searchTerm } = filterOptions;
    
    let usersQuery = collection(db, 'users');
    let constraints: any[] = [];
    
    // Add filters
    if (role) {
      constraints.push(where('role', '==', role));
    }
    
    if (status) {
      constraints.push(where('status', '==', status));
    }
    
    // Add ordering
    constraints.push(orderBy(orderByField, orderDirection));
    
    // Add pagination
    if (startAfter) {
      constraints.push(startAfter(startAfter));
    }
    
    constraints.push(limit(pageSize));
    
    // Execute query
    const usersSnapshot = await getDocs(query(usersQuery, ...constraints));
    
    // Filter by search term if provided (client-side filtering)
    let users = usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as User[];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      users = users.filter(user => 
        user.email.toLowerCase().includes(term) ||
        user.displayName.toLowerCase().includes(term)
      );
    }
    
    const lastDoc = usersSnapshot.docs.length > 0 
      ? usersSnapshot.docs[usersSnapshot.docs.length - 1] 
      : null;
    
    return { users, lastDoc };
  } catch (error) {
    console.error('Error getting users:', error);
    throw error;
  }
};

/**
 * Create a new user
 * @param userId User ID
 * @param userData User data
 * @returns Created user
 */
export const createUser = async (userId: string, userData: UserInput): Promise<User> => {
  try {
    const timestamp = serverTimestamp();
    const newUser = {
      ...userData,
      role: userData.role || 'user',
      status: userData.status || 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    await setDoc(doc(db, 'users', userId), newUser);
    
    return {
      id: userId,
      ...newUser,
    } as User;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

/**
 * Update a user
 * @param userId User ID
 * @param userData User data to update
 * @returns Updated user
 */
export const updateUser = async (userId: string, userData: Partial<UserInput>): Promise<User> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedData = {
      ...userData,
      updatedAt: serverTimestamp(),
    };
    
    await updateDoc(userRef, updatedData);
    
    // Get the updated user
    const updatedUserDoc = await getDoc(userRef);
    
    return {
      id: updatedUserDoc.id,
      ...updatedUserDoc.data(),
    } as User;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

/**
 * Delete a user
 * @param userId User ID
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

/**
 * Update user role
 * @param userId User ID
 * @param role New role
 */
export const updateUserRole = async (userId: string, role: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      role,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
};

/**
 * Update user status
 * @param userId User ID
 * @param status New status
 */
export const updateUserStatus = async (userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};
