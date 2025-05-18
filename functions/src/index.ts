import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { User, Coupon, Store, Notification } from './types';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Firestore
const db = admin.firestore();

// Initialize Express app
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken;
    }
  }
}

// Middleware to check admin role
const checkAdminRole = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (decodedToken.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

// User Management Endpoints
app.get('/users', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = usersSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Coupon Management Endpoints
app.post('/coupons', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const couponData: Omit<Coupon, 'id'> = {
      ...req.body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await db.collection('coupons').add(couponData);
    res.json({ id: docRef.id, ...couponData });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Store Management Endpoints
app.get('/stores', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const storesSnapshot = await db.collection('stores').get();
    const stores = storesSnapshot.docs.map((doc: admin.firestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    })) as Store[];
    res.json(stores);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Notification Endpoints
app.post('/notifications', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const { title, body, targetAudience, data } = req.body;
    
    const notificationData: Omit<Notification, 'id'> = {
      title,
      body,
      type: 'system', // Default type
      targetAudience,
      data,
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('notifications').add(notificationData);
    
    // Send FCM notification
    const message = {
      notification: {
        title,
        body
      },
      data,
      topic: targetAudience
    };

    await admin.messaging().send(message);
    
    res.json({ id: docRef.id, ...notificationData });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the Express app as a Firebase Function
export const api = functions.https.onRequest(app);

// Cloud Function to handle user role updates
export const onUserCreated = functions.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
  try {
    await db.collection('users').doc(user.uid).set({
      email: user.email,
      displayName: user.displayName || '',
      role: 'customer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true
    });
  } catch (error) {
    console.error('Error creating user document:', error);
  }
});

// Cloud Function to handle coupon redemption
export const onCouponRedeemed = functions.firestore
  .document('redemptions/{redemptionId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    try {
      const redemption = snap.data();
      const couponRef = db.collection('coupons').doc(redemption.couponId);
      const storeRef = db.collection('stores').doc(redemption.storeId);
      
      // Update coupon usage count
      await couponRef.update({
        usageCount: admin.firestore.FieldValue.increment(1)
      });

      // Notify store owner
      const store = await storeRef.get();
      const storeData = store.data();
      
      if (storeData?.merchantId) {
        const message = {
          notification: {
            title: 'Coupon Redeemed',
            body: `A customer has redeemed a coupon at your store!`
          },
          data: {
            type: 'coupon_redeemed',
            couponId: redemption.couponId,
            storeId: redemption.storeId
          },
          topic: `merchant_${storeData.merchantId}`
        };

        await admin.messaging().send(message);
      }
    } catch (error) {
      console.error('Error processing coupon redemption:', error);
    }
  }); 