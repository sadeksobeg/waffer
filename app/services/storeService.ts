import { firestore } from '../config/firebase';

// Collection reference
const STORES_COLLECTION = 'stores';

// Store status
export type StoreStatus = 'active' | 'inactive' | 'pending';

// Store interface
export interface Store {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  ownerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  logoUrl?: string;
  coverImageUrl?: string;
  website?: string;
  status: StoreStatus;
  categories: string[];
  createdAt: any;
  updatedAt: any;
}

/**
 * Get all stores
 */
export const getStores = async (status: StoreStatus = 'active'): Promise<Store[]> => {
  try {
    const querySnapshot = await firestore()
      .collection(STORES_COLLECTION)
      .where('status', '==', status)
      .orderBy('name', 'asc')
      .get();

    const stores: Store[] = [];

    querySnapshot.forEach((doc: any) => {
      stores.push({
        id: doc.id,
        ...doc.data()
      } as Store);
    });

    return stores;
  } catch (error) {
    console.error('Error getting stores:', error);
    throw error;
  }
};

/**
 * Get store by ID
 */
export const getStoreById = async (storeId: string): Promise<Store | null> => {
  try {
    const storeDoc = await firestore().collection(STORES_COLLECTION).doc(storeId).get();

    const data = storeDoc.data();
    if (data) {
      return {
        id: storeDoc.id,
        ...data
      } as Store;
    }

    return null;
  } catch (error) {
    console.error('Error getting store:', error);
    throw error;
  }
};

/**
 * Get store by owner ID
 */
export const getStoreByOwnerId = async (ownerId: string): Promise<Store | null> => {
  try {
    const querySnapshot = await firestore()
      .collection(STORES_COLLECTION)
      .where('ownerId', '==', ownerId)
      .limit(1)
      .get();

    if (!querySnapshot.empty) {
      const storeDoc = querySnapshot.docs[0];
      const data = storeDoc.data();
      if (data) {
        return {
          id: storeDoc.id,
          ...data
        } as Store;
      }
      return null;
    }

    return null;
  } catch (error) {
    console.error('Error getting store by owner:', error);
    throw error;
  }
};

/**
 * Create a new store
 */
export const createStore = async (storeData: Omit<Store, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    // Check if owner already has a store
    const existingStore = await getStoreByOwnerId(storeData.ownerId);

    if (existingStore) {
      throw new Error('User already has a store');
    }

    // Create new store with a random ID
    const storeId = Math.random().toString(36).substring(2, 15);

    await firestore().collection(STORES_COLLECTION).doc(storeId).set({
      ...storeData,
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp()
    });

    return storeId;
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

/**
 * Update an existing store
 */
export const updateStore = async (storeId: string, storeData: Partial<Store>): Promise<void> => {
  try {
    await firestore().collection(STORES_COLLECTION).doc(storeId).update({
      ...storeData,
      updatedAt: firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};

/**
 * Delete a store
 */
export const deleteStore = async (storeId: string): Promise<void> => {
  try {
    await firestore().collection(STORES_COLLECTION).doc(storeId).delete();
  } catch (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
};

/**
 * Get stores by category
 */
export const getStoresByCategory = async (category: string): Promise<Store[]> => {
  try {
    const querySnapshot = await firestore()
      .collection(STORES_COLLECTION)
      .where('status', '==', 'active')
      .where('categories', 'array-contains', category)
      .orderBy('name', 'asc')
      .get();

    const stores: Store[] = [];

    querySnapshot.forEach((doc: any) => {
      const data = doc.data();
      if (data) {
        stores.push({
          id: doc.id,
          ...data
        } as Store);
      }
    });

    return stores;
  } catch (error) {
    console.error('Error getting stores by category:', error);
    throw error;
  }
};

// Export a React component as default for Expo Router
export default function StoreService() {
  return null;
}