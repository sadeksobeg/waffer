import { api } from './apiClient';
import authService from './authService';
import userService from './userService';
import couponService from './couponService';
import analyticsService from './analyticsService';
import settingsService from './settingsService';
import dashboardService from './dashboardService';

export {
  api,
  authService,
  userService,
  couponService,
  analyticsService,
  settingsService,
  dashboardService,
};

export default {
  api,
  auth: authService,
  users: userService,
  coupons: couponService,
  analytics: analyticsService,
  settings: settingsService,
  dashboard: dashboardService,
};
