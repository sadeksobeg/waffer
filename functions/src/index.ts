import * as functions from 'firebase-functions';
import * as functionsV1 from 'firebase-functions/v1';
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

// Health check endpoint
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Coupon Management Endpoints
app.post('/coupons/:id/redeem', async (req: express.Request, res: express.Response) => {
  try {
    const couponId = req.params.id;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get the coupon
    const couponDoc = await db.collection('coupons').doc(couponId).get();

    if (!couponDoc.exists) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    const couponData = couponDoc.data();

    // Check if coupon is active
    if (!couponData.isActive) {
      return res.status(400).json({ error: 'Coupon is not active' });
    }

    // Check if coupon has expired
    const now = admin.firestore.Timestamp.now();
    if (couponData.endDate < now) {
      return res.status(400).json({ error: 'Coupon has expired' });
    }

    // Check if coupon has reached usage limit
    if (couponData.usageLimit > 0 && couponData.usedCount >= couponData.usageLimit) {
      return res.status(400).json({ error: 'Coupon usage limit reached' });
    }

    // Check if user has already redeemed this coupon
    const redemptionsQuery = await db.collection('redemptions')
      .where('couponId', '==', couponId)
      .where('userId', '==', userId)
      .get();

    if (!redemptionsQuery.empty) {
      return res.status(400).json({ error: 'User has already redeemed this coupon' });
    }

    // Create redemption record
    const redemptionData = {
      couponId,
      userId,
      redeemedAt: now,
      discountValue: couponData.discountValue,
      discountType: couponData.discountType,
      merchantId: couponData.merchantId,
    };

    await db.collection('redemptions').add(redemptionData);

    // Update coupon used count
    await db.collection('coupons').doc(couponId).update({
      usedCount: admin.firestore.FieldValue.increment(1),
      updatedAt: now
    });

    res.json({ success: true, message: 'Coupon redeemed successfully' });
  } catch (error) {
    console.error('Error redeeming coupon:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auth endpoints
app.post('/auth/switch-role', async (req: express.Request, res: express.Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;

    const { role } = req.body;

    if (!role || !['admin', 'merchant', 'customer', 'support'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user has the requested role
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Get user custom claims
    const userRecord = await admin.auth().getUser(userId);
    const customClaims = userRecord.customClaims || {};

    // Check if user has multiple roles
    const userRoles = userData.roles || [userData.role || 'customer'];

    if (!userRoles.includes(role)) {
      return res.status(403).json({ error: 'User does not have the requested role' });
    }

    // Update custom claims with the new active role
    await admin.auth().setCustomUserClaims(userId, {
      ...customClaims,
      role
    });

    // Get updated user data
    const updatedUser = {
      id: userId,
      email: userData.email,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      role: role,
      avatar: userData.avatar || '',
    };

    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Error switching role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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
    return next();
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

// Get a single user
app.get('/users/:id', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.id;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();

    // Get user custom claims
    const userRecord = await admin.auth().getUser(userId);
    const customClaims = userRecord.customClaims || {};

    res.json({
      id: userDoc.id,
      ...userData,
      role: customClaims.role || userData?.role || 'customer'
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user role
app.post('/users/:id/role', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role || !['admin', 'merchant', 'customer', 'support'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Update custom claims
    await admin.auth().setCustomUserClaims(userId, { role });

    // Update user document in Firestore
    await db.collection('users').doc(userId).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user email (admin only)
app.post('/users/:id/email', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.id;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Update user email in Firebase Auth
    await admin.auth().updateUser(userId, { email });

    // Update user document in Firestore
    await db.collection('users').doc(userId).update({
      email,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'User email updated successfully' });
  } catch (error) {
    console.error('Error updating user email:', error);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ error: 'Email already in use' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user password (admin only)
app.post('/users/:id/password', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // Update user password in Firebase Auth
    await admin.auth().updateUser(userId, { password });

    res.json({ success: true, message: 'User password updated successfully' });
  } catch (error) {
    console.error('Error updating user password:', error);

    // Handle specific Firebase Auth errors
    if (error.code === 'auth/invalid-password') {
      return res.status(400).json({ error: 'Invalid password format' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user status (active/inactive)
app.patch('/users/:id/status', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ error: 'Status is required' });
    }

    // Update user status in Firebase Auth
    await admin.auth().updateUser(userId, { disabled: !isActive });

    // Update user document in Firestore
    await db.collection('users').doc(userId).update({
      isActive,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json({ success: true, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete user
app.delete('/users/:id', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.params.id;

    // Delete user from Firebase Auth
    await admin.auth().deleteUser(userId);

    // Delete user document from Firestore
    await db.collection('users').doc(userId).delete();

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Import users from CSV/Excel
app.post('/users/import', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    // In a real implementation, you would download the file from the URL,
    // parse it, and create users in Firebase Auth and Firestore

    // For now, return a mock response
    res.json({
      success: 5,
      failed: 1,
      errors: ['Error creating user: Email already exists']
    });
  } catch (error) {
    console.error('Error importing users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export users to CSV/Excel
app.get('/users/export', checkAdminRole, async (req: express.Request, res: express.Response) => {
  try {
    const format = req.query.format as string || 'csv';

    // In a real implementation, you would query Firestore for users based on filters,
    // format the data as CSV or Excel, and return it

    // For now, return a mock CSV file
    const mockCsv = 'id,firstName,lastName,email,role,isActive,createdAt\n' +
                   'user1,John,Doe,john@example.com,admin,true,2023-01-01\n' +
                   'user2,Jane,Smith,jane@example.com,merchant,true,2023-01-02\n';

    res.setHeader('Content-Type', format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=users.${format}`);
    res.send(mockCsv);
  } catch (error) {
    console.error('Error exporting users:', error);
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

    // Use a type assertion to handle the serverTimestamp
    const notificationData = {
      title,
      body,
      type: 'system' as const, // Default type
      targetAudience,
      data,
      sentAt: admin.firestore.FieldValue.serverTimestamp()
    } as Omit<Notification, 'id'>;

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
export const onUserCreated = functionsV1.auth.user().onCreate(async (user: admin.auth.UserRecord) => {
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
export const onCouponRedeemed = functionsV1.firestore
  .document('redemptions/{redemptionId}')
  .onCreate(async (snap: functionsV1.firestore.QueryDocumentSnapshot, context: functionsV1.EventContext) => {
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