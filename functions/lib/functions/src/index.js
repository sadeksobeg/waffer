"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onCouponRedeemed = exports.onUserCreated = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Initialize Firebase Admin
admin.initializeApp();
// Initialize Firestore
const db = admin.firestore();
// Initialize Express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.use(express_1.default.json());
// Middleware to check admin role
const checkAdminRole = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await admin.auth().verifyIdToken(token);
        if (decodedToken.role !== 'admin') {
            res.status(403).json({ error: 'Forbidden' });
            return;
        }
        req.user = decodedToken;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Unauthorized' });
    }
};
// User Management Endpoints
app.get('/users', checkAdminRole, async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = usersSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Coupon Management Endpoints
app.post('/coupons', checkAdminRole, async (req, res) => {
    try {
        const couponData = Object.assign(Object.assign({}, req.body), { createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        const docRef = await db.collection('coupons').add(couponData);
        res.json(Object.assign({ id: docRef.id }, couponData));
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Store Management Endpoints
app.get('/stores', checkAdminRole, async (req, res) => {
    try {
        const storesSnapshot = await db.collection('stores').get();
        const stores = storesSnapshot.docs.map((doc) => (Object.assign({ id: doc.id }, doc.data())));
        res.json(stores);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Notification Endpoints
app.post('/notifications', checkAdminRole, async (req, res) => {
    try {
        const { title, body, targetAudience, data } = req.body;
        const notificationData = {
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
        res.json(Object.assign({ id: docRef.id }, notificationData));
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Export the Express app as a Firebase Function
exports.api = functions.https.onRequest(app);
// Cloud Function to handle user role updates
exports.onUserCreated = functions.auth.user().onCreate(async (user) => {
    try {
        await db.collection('users').doc(user.uid).set({
            email: user.email,
            displayName: user.displayName || '',
            role: 'customer',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
            isActive: true
        });
    }
    catch (error) {
        console.error('Error creating user document:', error);
    }
});
// Cloud Function to handle coupon redemption
exports.onCouponRedeemed = functions.firestore
    .document('redemptions/{redemptionId}')
    .onCreate(async (snap, context) => {
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
        if (storeData === null || storeData === void 0 ? void 0 : storeData.merchantId) {
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
    }
    catch (error) {
        console.error('Error processing coupon redemption:', error);
    }
});
//# sourceMappingURL=index.js.map