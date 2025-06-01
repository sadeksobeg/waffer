import { api } from './apiClient';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  DocumentData,
  QueryDocumentSnapshot,
  getCountFromServer
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser as deleteFirebaseUser,
  updateEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, auth, storage } from '@/config/firebase';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  roles?: string[];
  isActive: boolean;
  avatar?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  updatedAt?: Date;
  storeName?: string; // For merchants
  storeId?: string; // For merchants
  phoneNumber?: string;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  isActive: boolean;
  role: string;
  roles?: string[];
  storeName?: string; // For merchants
  storeId?: string; // For merchants
  phoneNumber?: string;
  avatar?: string;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  role?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  lastDoc?: QueryDocumentSnapshot<DocumentData> | null;
}

// Helper function to convert Firestore document to User
const convertDocToUser = (doc: DocumentData): User => {
  const data = doc.data();
  return {
    id: doc.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    email: data.email || '',
    role: data.role || 'customer',
    roles: data.roles || [data.role || 'customer'],
    isActive: data.isActive !== undefined ? data.isActive : true,
    avatar: data.avatar || '',
    createdAt: data.createdAt?.toDate() || new Date(),
    lastLoginAt: data.lastLoginAt?.toDate() || undefined,
    updatedAt: data.updatedAt?.toDate() || undefined,
    storeName: data.storeName || '',
    storeId: data.storeId || '',
    phoneNumber: data.phoneNumber || '',
  };
};

const userService = {
  /**
   * Get all users with pagination and filtering
   */
  getUsers: async (
    page: number = 1,
    pageSize: number = 10,
    filters?: UserFilters,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<PaginatedResponse<User>> => {
    try {
      // Build the query
      let usersQuery = query(collection(db, 'users'));

      // Apply filters
      if (filters?.role && filters.role.length > 0) {
        usersQuery = query(usersQuery, where('role', 'in', filters.role));
      }

      if (filters?.isActive !== undefined) {
        usersQuery = query(usersQuery, where('isActive', '==', filters.isActive));
      }

      if (filters?.dateRange?.start) {
        const startDate = Timestamp.fromDate(filters.dateRange.start);
        usersQuery = query(usersQuery, where('createdAt', '>=', startDate));
      }

      if (filters?.dateRange?.end) {
        const endDate = Timestamp.fromDate(filters.dateRange.end);
        usersQuery = query(usersQuery, where('createdAt', '<=', endDate));
      }

      // Add ordering
      usersQuery = query(usersQuery, orderBy('createdAt', 'desc'));

      // Get total count
      const countSnapshot = await getCountFromServer(usersQuery);
      const total = countSnapshot.data().count;

      // Apply pagination
      if (lastDoc) {
        usersQuery = query(usersQuery, startAfter(lastDoc), limit(pageSize));
      } else {
        // First page
        usersQuery = query(usersQuery, limit(pageSize));
      }

      // Execute query
      const querySnapshot = await getDocs(usersQuery);

      // Convert to User objects
      const users: User[] = [];
      let lastVisible: QueryDocumentSnapshot<DocumentData> | null = null;

      querySnapshot.forEach((doc) => {
        // Get the last document for pagination
        lastVisible = doc;

        // Convert document to User
        const user = convertDocToUser(doc);

        // Apply search filter on client side if needed
        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          const email = user.email.toLowerCase();

          if (fullName.includes(searchLower) || email.includes(searchLower)) {
            users.push(user);
          }
        } else {
          users.push(user);
        }
      });

      // Calculate total pages
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: users,
        total,
        page,
        limit: pageSize,
        totalPages,
        lastDoc: lastVisible
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Get a specific user by ID
   */
  getUserById: async (id: string): Promise<User> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', id));

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      return convertDocToUser(userDoc);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  /**
   * Create a new user
   */
  createUser: async (userData: UserFormData): Promise<User> => {
    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password || Math.random().toString(36).slice(2, 10) // Generate random password if not provided
      );

      const firebaseUser = userCredential.user;

      // Update display name
      await updateProfile(firebaseUser, {
        displayName: `${userData.firstName} ${userData.lastName}`
      });

      // Prepare user data for Firestore
      const userDoc = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        roles: userData.roles || [userData.role],
        isActive: userData.isActive,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...(userData.storeName && { storeName: userData.storeName }),
        ...(userData.storeId && { storeId: userData.storeId }),
        ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber }),
        ...(userData.avatar && { avatar: userData.avatar }),
      };

      // Save user data to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

      // Call Firebase Function to set custom claims (role)
      await api.post(`/users/${firebaseUser.uid}/role`, { role: userData.role });

      // Return the created user
      return {
        id: firebaseUser.uid,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        role: userData.role,
        roles: userData.roles || [userData.role],
        isActive: userData.isActive,
        createdAt: new Date(),
        ...(userData.storeName && { storeName: userData.storeName }),
        ...(userData.storeId && { storeId: userData.storeId }),
        ...(userData.phoneNumber && { phoneNumber: userData.phoneNumber }),
        ...(userData.avatar && { avatar: userData.avatar }),
      };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Update an existing user
   */
  updateUser: async (id: string, userData: Partial<UserFormData>): Promise<User> => {
    try {
      // Get the current user data
      const userRef = doc(db, 'users', id);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error('User not found');
      }

      const currentUser = userDoc.data();

      // Prepare update data
      const updateData: any = {
        updatedAt: serverTimestamp(),
      };

      // Add fields that are being updated
      if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
      if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
      if (userData.isActive !== undefined) updateData.isActive = userData.isActive;
      if (userData.role !== undefined) {
        updateData.role = userData.role;

        // Update custom claims via Firebase Function
        await api.post(`/users/${id}/role`, { role: userData.role });
      }
      if (userData.roles !== undefined) updateData.roles = userData.roles;
      if (userData.storeName !== undefined) updateData.storeName = userData.storeName;
      if (userData.storeId !== undefined) updateData.storeId = userData.storeId;
      if (userData.phoneNumber !== undefined) updateData.phoneNumber = userData.phoneNumber;
      if (userData.avatar !== undefined) updateData.avatar = userData.avatar;

      // Update Firestore document
      await updateDoc(userRef, updateData);

      // If email is being updated, update it in Firebase Auth
      if (userData.email !== undefined && userData.email !== currentUser.email) {
        const user = auth.currentUser;
        if (user && user.uid === id) {
          await updateEmail(user, userData.email);
        } else {
          // For admin updating another user's email, we need to use Admin SDK
          // This is handled by the Firebase Function
          await api.post(`/users/${id}/email`, { email: userData.email });
        }

        // Update email in Firestore
        await updateDoc(userRef, { email: userData.email });
      }

      // If password is being updated, update it in Firebase Auth
      if (userData.password) {
        const user = auth.currentUser;
        if (user && user.uid === id) {
          await updatePassword(user, userData.password);
        } else {
          // For admin updating another user's password, we need to use Admin SDK
          // This is handled by the Firebase Function
          await api.post(`/users/${id}/password`, { password: userData.password });
        }
      }

      // Get the updated user
      const updatedUserDoc = await getDoc(userRef);
      return convertDocToUser(updatedUserDoc);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  /**
   * Delete a user
   */
  deleteUser: async (id: string): Promise<void> => {
    try {
      // Delete user from Firestore
      await deleteDoc(doc(db, 'users', id));

      // Delete user from Firebase Authentication (requires Admin SDK)
      // This is handled by a Firebase Function
      await api.delete(`/users/${id}`);

      // Delete user avatar if exists
      try {
        const userDoc = await getDoc(doc(db, 'users', id));
        if (userDoc.exists() && userDoc.data().avatar) {
          const avatarRef = ref(storage, `avatars/${id}`);
          await deleteObject(avatarRef);
        }
      } catch (error) {
        console.error('Error deleting user avatar:', error);
        // Continue with deletion even if avatar deletion fails
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  /**
   * Change user status (activate/deactivate)
   */
  changeUserStatus: async (id: string, isActive: boolean): Promise<User> => {
    try {
      const userRef = doc(db, 'users', id);

      // Update user status in Firestore
      await updateDoc(userRef, {
        isActive,
        updatedAt: serverTimestamp()
      });

      // Disable/enable user in Firebase Authentication (requires Admin SDK)
      // This is handled by a Firebase Function
      await api.patch(`/users/${id}/status`, { isActive });

      // Get the updated user
      const updatedUserDoc = await getDoc(userRef);
      return convertDocToUser(updatedUserDoc);
    } catch (error) {
      console.error('Error changing user status:', error);
      throw error;
    }
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (id: string, file: File): Promise<{ avatarUrl: string }> => {
    try {
      // Create a reference to the storage location
      const avatarRef = ref(storage, `avatars/${id}`);

      // Upload the file
      await uploadBytes(avatarRef, file);

      // Get the download URL
      const avatarUrl = await getDownloadURL(avatarRef);

      // Update the user document with the avatar URL
      const userRef = doc(db, 'users', id);
      await updateDoc(userRef, {
        avatar: avatarUrl,
        updatedAt: serverTimestamp()
      });

      return { avatarUrl };
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },

  /**
   * Import users from CSV/Excel file
   */
  importUsers: async (file: File, onProgress?: (progress: number) => void): Promise<{
    success: number;
    failed: number;
    errors?: string[]
  }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload the file to Firebase Storage
      const fileRef = ref(storage, `imports/users/${Date.now()}_${file.name}`);

      // Track upload progress
      const uploadTask = uploadBytes(fileRef, file);

      // Wait for upload to complete
      await uploadTask;

      // Get the download URL
      const downloadURL = await getDownloadURL(fileRef);

      // Call the Firebase Function to process the file
      const result = await api.post<{ success: number; failed: number; errors?: string[] }>(
        '/users/import',
        { fileUrl: downloadURL },
        {
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              onProgress(progress);
            }
          },
        }
      );

      return result;
    } catch (error) {
      console.error('Error importing users:', error);
      throw error;
    }
  },

  /**
   * Export users to CSV/Excel
   */
  exportUsers: async (format: 'csv' | 'excel', filters?: UserFilters): Promise<Blob> => {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        format,
      });

      if (filters?.search) {
        params.append('search', filters.search);
      }

      if (filters?.isActive !== undefined) {
        params.append('isActive', filters.isActive.toString());
      }

      if (filters?.role && filters.role.length > 0) {
        filters.role.forEach(role => {
          params.append('role', role);
        });
      }

      if (filters?.dateRange?.start) {
        params.append('startDate', filters.dateRange.start.toISOString());
      }

      if (filters?.dateRange?.end) {
        params.append('endDate', filters.dateRange.end.toISOString());
      }

      // Call the Firebase Function to generate the export file
      const response = await api.get<Blob>(`/users/export?${params.toString()}`, {
        responseType: 'blob',
      });

      return response;
    } catch (error) {
      console.error('Error exporting users:', error);
      throw error;
    }
  },
};

export default userService;
