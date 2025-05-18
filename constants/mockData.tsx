import React from 'react';
import {
  ShoppingBag,
  Coffee,
  Utensils,
  Shirt,
  Plane,
  Home,
  PaintBucket,
  Dumbbell,
  Smartphone,
  Car
} from 'lucide-react-native';

// Mock categories with icons
export const mockCategories = [
  { id: 'retail', name: 'Retail', icon: <ShoppingBag size={24} color="#0ea5e9" /> },
  { id: 'food', name: 'Food', icon: <Utensils size={24} color="#0ea5e9" /> },
  { id: 'coffee', name: 'Coffee', icon: <Coffee size={24} color="#0ea5e9" /> },
  { id: 'fashion', name: 'Fashion', icon: <Shirt size={24} color="#0ea5e9" /> },
  { id: 'travel', name: 'Travel', icon: <Plane size={24} color="#0ea5e9" /> },
  { id: 'home', name: 'Home', icon: <Home size={24} color="#0ea5e9" /> },
  { id: 'beauty', name: 'Beauty', icon: <PaintBucket size={24} color="#0ea5e9" /> },
  { id: 'fitness', name: 'Fitness', icon: <Dumbbell size={24} color="#0ea5e9" /> },
  { id: 'electronics', name: 'Electronics', icon: <Smartphone size={24} color="#0ea5e9" /> },
  { id: 'automotive', name: 'Automotive', icon: <Car size={24} color="#0ea5e9" /> },
];

// Mock stores
export const mockStores = [
  {
    id: 'store1',
    name: 'Fashion Hub',
    image: 'https://images.pexels.com/photos/1884584/pexels-photo-1884584.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'fashion',
    couponCount: 5,
  },
  {
    id: 'store2',
    name: 'Café Delight',
    image: 'https://images.pexels.com/photos/1813466/pexels-photo-1813466.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'coffee',
    couponCount: 3,
  },
  {
    id: 'store3',
    name: 'Tech World',
    image: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'electronics',
    couponCount: 4,
  },
  {
    id: 'store4',
    name: 'Fitness First',
    image: 'https://images.pexels.com/photos/703016/pexels-photo-703016.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'fitness',
    couponCount: 2,
  },
  {
    id: 'store5',
    name: 'Travel Paradise',
    image: 'https://images.pexels.com/photos/2007401/pexels-photo-2007401.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'travel',
    couponCount: 6,
  },
  {
    id: 'store6',
    name: 'Home Essentials',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'home',
    couponCount: 3,
  },
];

// Generate random date in the last 30 days
const getRandomRecentDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Generate random future date in the next 30 days
const getRandomFutureDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Generate past date for expired coupons
const getRandomPastDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30) - 1);
  return date.toISOString();
};

// Mock coupons
export const mockCoupons = [
  {
    id: 'coupon1',
    title: '20% Off All Clothing',
    description: 'Get 20% off on all clothing items. Valid for both online and in-store purchases.',
    discount: '20',
    merchant: mockStores[0],
    category: 'fashion',
    expiryDate: getRandomFutureDate(),
    createdAt: getRandomRecentDate(),
    code: 'FASHION20',
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'coupon2',
    title: 'Free Coffee with Breakfast',
    description: 'Get a free coffee when you order any breakfast item from our menu.',
    discount: '100',
    merchant: mockStores[1],
    category: 'coffee',
    expiryDate: getRandomFutureDate(),
    createdAt: getRandomRecentDate(),
    code: 'MORNINGCOFFEE',
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'coupon3',
    title: '30% Off Smartphones',
    description: 'Get 30% off on selected smartphone models. Limited time offer.',
    discount: '30',
    merchant: mockStores[2],
    category: 'electronics',
    expiryDate: getRandomFutureDate(),
    createdAt: getRandomRecentDate(),
    code: 'PHONE30',
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'coupon4',
    title: '2 Months Free Membership',
    description: 'Sign up for a 6-month membership and get 2 months free. New members only.',
    discount: '33',
    merchant: mockStores[3],
    category: 'fitness',
    expiryDate: getRandomPastDate(),
    createdAt: getRandomRecentDate(),
    code: 'FIT2FREE',
    usageLimit: 1,
    usedCount: 1,
  },
  {
    id: 'coupon5',
    title: '15% Off Flight Bookings',
    description: 'Use this coupon to get 15% off on all international flight bookings.',
    discount: '15',
    merchant: mockStores[4],
    category: 'travel',
    expiryDate: getRandomFutureDate(),
    createdAt: getRandomRecentDate(),
    code: 'FLYNOW15',
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'coupon6',
    title: 'Buy 1 Get 1 Free on Home Decor',
    description: 'Purchase any home decor item and get another one of equal or lesser value for free.',
    discount: '50',
    merchant: mockStores[5],
    category: 'home',
    expiryDate: getRandomFutureDate(),
    createdAt: getRandomRecentDate(),
    code: 'HOMEDECOR2',
    usageLimit: 1,
    usedCount: 0,
  },
  {
    id: 'coupon7',
    title: '40% Off Winter Collection',
    description: 'Get 40% off on our entire winter collection. While supplies last.',
    discount: '40',
    merchant: mockStores[0],
    category: 'fashion',
    expiryDate: getRandomPastDate(),
    createdAt: getRandomRecentDate(),
    code: 'WINTER40',
    usageLimit: 1,
    usedCount: 1,
  },
];

// Mock points history
export const mockPointsHistory = [
  {
    id: 'points1',
    amount: 50,
    type: 'earned',
    description: 'Redeemed coupon at Fashion Hub',
    date: getRandomRecentDate(),
    merchant: mockStores[0],
  },
  {
    id: 'points2',
    amount: 25,
    type: 'earned',
    description: 'Redeemed coupon at Café Delight',
    date: getRandomRecentDate(),
    merchant: mockStores[1],
  },
  {
    id: 'points3',
    amount: 100,
    type: 'spent',
    description: 'Redeemed for $10 gift card',
    date: getRandomRecentDate(),
    merchant: null,
  },
  {
    id: 'points4',
    amount: 75,
    type: 'earned',
    description: 'Redeemed coupon at Tech World',
    date: getRandomRecentDate(),
    merchant: mockStores[2],
  },
  {
    id: 'points5',
    amount: 200,
    type: 'spent',
    description: 'Redeemed for free coffee voucher',
    date: getRandomRecentDate(),
    merchant: null,
  },
];

// Mock rewards
export const mockRewards = [
  {
    id: 'reward1',
    title: '$10 Gift Card',
    points: 200,
    description: 'Redeem 200 points for a $10 gift card that can be used at any participating store.',
    image: 'https://images.pexels.com/photos/6634086/pexels-photo-6634086.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'reward2',
    title: 'Free Coffee Voucher',
    points: 100,
    description: 'Redeem 100 points for a free coffee voucher at Café Delight.',
    image: 'https://images.pexels.com/photos/1692295/pexels-photo-1692295.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'reward3',
    title: 'Movie Ticket',
    points: 300,
    description: 'Redeem 300 points for a standard movie ticket at participating theaters.',
    image: 'https://images.pexels.com/photos/19527595/pexels-photo-19527595/free-photo-of-popcorn-and-movie-tickets.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
  {
    id: 'reward4',
    title: 'Premium Membership',
    points: 500,
    description: 'Redeem 500 points for a one-month premium membership with exclusive benefits.',
    image: 'https://images.pexels.com/photos/5076516/pexels-photo-5076516.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  },
];

// Mock admin statistics
export const mockAdminStats = {
  totalUsers: 1245,
  totalMerchants: 78,
  totalCoupons: 342,
  totalRedemptions: 2567,
};

// Mock chart data for admin dashboard
export const mockChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
    }
  ],
};

// Mock users for admin
export const mockUsers = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'customer',
    joinDate: getRandomRecentDate(),
    points: 450,
    couponsRedeemed: 12,
  },
  {
    id: 'user2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'merchant',
    joinDate: getRandomRecentDate(),
    storeName: 'Fashion Hub',
    couponsCreated: 5,
  },
  {
    id: 'user3',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    role: 'customer',
    joinDate: getRandomRecentDate(),
    points: 300,
    couponsRedeemed: 8,
  },
  {
    id: 'user4',
    name: 'Lisa Brown',
    email: 'lisa@example.com',
    role: 'merchant',
    joinDate: getRandomRecentDate(),
    storeName: 'Café Delight',
    couponsCreated: 3,
  },
  {
    id: 'user5',
    name: 'Robert Wilson',
    email: 'robert@example.com',
    role: 'customer',
    joinDate: getRandomRecentDate(),
    points: 550,
    couponsRedeemed: 15,
  },
];