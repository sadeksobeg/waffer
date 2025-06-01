import { firestore } from '../config/firebase';
import { User, UserRole } from '../../contexts/AuthContext';

// Collection reference
const USERS_COLLECTION = 'users';

/**
 * Get a user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const userDoc = await firestore().collection(USERS_COLLECTION).doc(userId).get();

    // Check if document exists and has data
    const userData = userDoc.data();
    if (userData) {
      return {
        id: userDoc.id,
        email: userData.email,
        name: userData.displayName,
        role: userData.role,
        points: userData.points,
        storeId: userData.storeId,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  data: { displayName?: string; photoURL?: string; }
): Promise<void> => {
  try {
    await firestore().collection(USERS_COLLECTION).doc(userId).update({
      ...data,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user points
 */
export const updateUserPoints = async (
  userId: string,
  points: number,
  operation: 'add' | 'subtract' | 'set' = 'add'
): Promise<number> => {
  try {
    const userDoc = await firestore().collection(USERS_COLLECTION).doc(userId).get();

    const userData = userDoc.data();
    if (!userData) {
      throw new Error('User not found');
    }

    let newPoints = userData.points || 0;

    if (operation === 'add') {
      newPoints += points;
    } else if (operation === 'subtract') {
      newPoints = Math.max(0, newPoints - points);
    } else {
      newPoints = points;
    }

    await firestore().collection(USERS_COLLECTION).doc(userId).update({
      points: newPoints,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    return newPoints;
  } catch (error) {
    console.error('Error updating user points:', error);
    throw error;
  }
};

/**
 * Get users by role
 */
export const getUsersByRole = async (role: UserRole): Promise<User[]> => {
  try {
    const querySnapshot = await firestore()
      .collection(USERS_COLLECTION)
      .where('role', '==', role)
      .orderBy('createdAt', 'desc')
      .get();

    const users: User[] = [];

    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data) {
        users.push({
          id: doc.id,
          email: data.email,
          name: data.displayName,
          role: data.role,
          points: data.points,
          storeId: data.storeId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        });
      }
    });

    return users;
  } catch (error) {
    console.error('Error getting users by role:', error);
    throw error;
  }
};

/**
 * Create or update a user
 */
export const createOrUpdateUser = async (
  userId: string,
  userData: any
): Promise<void> => {
  try {
    const userDoc = await firestore().collection(USERS_COLLECTION).doc(userId).get();

    // Check if document exists and has data
    const docData = userDoc.data();

    if (docData) {
      // Update existing user
      await firestore().collection(USERS_COLLECTION).doc(userId).update({
        ...userData,
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Create new user
      await firestore().collection(USERS_COLLECTION).doc(userId).set({
        ...userData,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    throw error;
  }
};

// Export a React component as default for Expo Router
export default function UserService() {
  return null;
}