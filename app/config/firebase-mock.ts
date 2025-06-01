// This is a mock implementation of Firebase for development
// It allows the app to run without Firebase dependencies

// Mock Firebase Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: (user: any) => void) => {
    // Return an unsubscribe function
    return () => {};
  },
  signInWithEmailAndPassword: async (email: string, password: string) => {
    // Mock user based on email - return different UIDs for different roles
    let uid = '123456'; // default
    let displayName = email.split('@')[0];

    if (email.includes('admin')) {
      uid = 'admin-123456';
      displayName = 'Admin User';
    } else if (email.includes('merchant')) {
      uid = 'merchant-123456';
      displayName = 'Merchant User';
    } else if (email.includes('customer')) {
      uid = 'customer-123456';
      displayName = 'Customer User';
    }

    const user = {
      uid,
      email,
      displayName,
      updateProfile: async (data: any) => {}
    };

    return { user };
  },
  createUserWithEmailAndPassword: async (email: string, password: string) => {
    // Mock user
    const user = {
      uid: '123456',
      email,
      displayName: email.split('@')[0],
      updateProfile: async (data: any) => {}
    };

    return { user };
  },
  signOut: async () => {
    // Mock sign out
    return Promise.resolve();
  }
};

// Mock Firestore
export const db = {
  collection: (collectionName: string) => ({
    doc: (docId: string) => ({
      get: async () => ({
        exists: true,
        id: docId,
        data: () => {
          // Return mock data based on collection and docId
          if (collectionName === 'users') {
            // Return different user data based on docId (which is the user's UID)
            if (docId.includes('admin') || docId === '123456') {
              return {
                email: 'admin@test.com',
                displayName: 'Admin User',
                role: 'admin',
                points: 0,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            } else if (docId.includes('merchant')) {
              return {
                email: 'merchant@test.com',
                displayName: 'Merchant User',
                role: 'merchant',
                points: 0,
                storeId: 'store-123',
                createdAt: new Date(),
                updatedAt: new Date()
              };
            } else {
              return {
                email: 'customer@test.com',
                displayName: 'Customer User',
                role: 'customer',
                points: 100,
                createdAt: new Date(),
                updatedAt: new Date()
              };
            }
          } else if (collectionName === 'coupons') {
            return {
              code: 'TEST123',
              title: 'Test Coupon',
              description: 'Test description',
              type: 'percentage',
              value: 25,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              storeId: 'store123',
              storeName: 'Test Store',
              status: 'active',
              usageLimit: 10,
              usageCount: 0,
              createdBy: 'user123',
              categories: ['food']
            };
          } else if (collectionName === 'stores') {
            return {
              name: 'Test Store',
              description: 'Test store description',
              ownerId: 'user123',
              ownerName: 'Store Owner',
              email: 'store@example.com',
              phone: '123-456-7890',
              address: '123 Main St',
              city: 'Test City',
              state: 'TS',
              zipCode: '12345',
              country: 'Test Country',
              status: 'active',
              categories: ['food', 'retail'],
              createdAt: new Date(),
              updatedAt: new Date()
            };
          }
          return {};
        }
      }),
      set: async (data: any) => Promise.resolve(),
      update: async (data: any) => Promise.resolve()
    }),
    add: async (data: any) => ({ id: 'new-doc-id' }),
    where: () => ({
      orderBy: () => ({
        limit: () => ({
          get: async () => ({
            empty: false,
            docs: [{
              id: 'doc-id',
              data: () => ({
                // Mock data
                email: 'user@example.com',
                displayName: 'Test User',
                role: 'customer'
              }),
              exists: true
            }]
          })
        }),
        get: async () => ({
          empty: false,
          docs: [{
            id: 'doc-id',
            data: () => ({
              // Mock data
              email: 'user@example.com',
              displayName: 'Test User',
              role: 'customer'
            }),
            exists: true
          }]
        })
      }),
      limit: () => ({
        get: async () => ({
          empty: false,
          docs: [{
            id: 'doc-id',
            data: () => ({
              // Mock data
              email: 'user@example.com',
              displayName: 'Test User',
              role: 'customer'
            }),
            exists: true
          }]
        })
      }),
      get: async () => ({
        empty: false,
        docs: [{
          id: 'doc-id',
          data: () => ({
            // Mock data
            email: 'user@example.com',
            displayName: 'Test User',
            role: 'customer'
          }),
          exists: true
        }]
      })
    }),
    orderBy: () => ({
      limit: () => ({
        get: async () => ({
          empty: false,
          docs: [{
            id: 'doc-id',
            data: () => ({
              // Mock data
              email: 'user@example.com',
              displayName: 'Test User',
              role: 'customer'
            }),
            exists: true
          }]
        })
      })
    })
  })
};

// Mock Storage
export const storage = {
  ref: (path: string) => ({
    put: async (file: any) => ({
      ref: {
        getDownloadURL: async () => 'https://example.com/image.jpg'
      }
    }),
    getDownloadURL: async () => 'https://example.com/image.jpg'
  })
};

// Mock Firebase
const firebase = {
  auth: () => auth,
  firestore: () => db,
  storage: () => storage,
  firestore: {
    FieldValue: {
      serverTimestamp: () => new Date(),
      increment: (num: number) => num
    },
    Timestamp: {
      now: () => ({
        toMillis: () => Date.now(),
        toDate: () => new Date()
      }),
      fromDate: (date: Date) => ({
        toMillis: () => date.getTime(),
        toDate: () => date
      })
    }
  }
};

export default firebase;
