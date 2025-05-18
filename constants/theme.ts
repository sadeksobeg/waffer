import { StyleSheet } from 'react-native';

// Theme constants
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  h1: 30,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
};

// Color palette
export const COLORS = {
  // Primary brand color - Sky Blue
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Secondary - Teal
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },
  
  // Accent - Orange
  accent: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  
  // Success - Green
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  
  // Warning - Yellow
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  
  // Error - Red
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  
  // Neutrals - Gray
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Common
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// Base theme
const baseTheme = {
  spacing: SPACING,
  sizes: SIZES,
  colors: COLORS,
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 9999,
  },
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    bold: 'Inter-Bold',
  },
};

// Light theme
export const lightTheme = {
  ...baseTheme,
  dark: false,
  colors: {
    ...baseTheme.colors,
    background: COLORS.white,
    surface: COLORS.white,
    surfaceVariant: COLORS.neutral[100],
    text: COLORS.neutral[900],
    secondaryText: COLORS.neutral[600],
    border: COLORS.neutral[200],
    card: COLORS.white,
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    statusBar: 'dark',
  },
};

// Dark theme
export const darkTheme = {
  ...baseTheme,
  dark: true,
  colors: {
    ...baseTheme.colors,
    background: COLORS.neutral[900],
    surface: COLORS.neutral[800],
    surfaceVariant: COLORS.neutral[700],
    text: COLORS.neutral[50],
    secondaryText: COLORS.neutral[300],
    border: COLORS.neutral[700],
    card: COLORS.neutral[800],
    cardShadow: 'rgba(0, 0, 0, 0.5)',
    statusBar: 'light',
  },
};

// Define theme type
export type Theme = typeof lightTheme;

// Create common styles based on theme
export const createThemedStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    screenContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    card: {
      backgroundColor: theme.colors.card,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginVertical: theme.spacing.sm,
    },
    shadow: {
      shadowColor: theme.colors.cardShadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    title: {
      fontFamily: theme.fontFamily.bold,
      fontSize: theme.sizes.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    subtitle: {
      fontFamily: theme.fontFamily.medium,
      fontSize: theme.sizes.h4,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    text: {
      fontFamily: theme.fontFamily.regular,
      fontSize: theme.sizes.md,
      color: theme.colors.text,
    },
    secondaryText: {
      fontFamily: theme.fontFamily.regular,
      fontSize: theme.sizes.sm,
      color: theme.colors.secondaryText,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spaceBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    button: {
      backgroundColor: theme.colors.primary[500],
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      fontFamily: theme.fontFamily.medium,
      fontSize: theme.sizes.md,
      color: theme.colors.white,
    },
    secondaryButton: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      fontFamily: theme.fontFamily.medium,
      fontSize: theme.sizes.md,
      color: theme.colors.primary[600],
    },
    input: {
      backgroundColor: theme.colors.surfaceVariant,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontFamily: theme.fontFamily.regular,
      fontSize: theme.sizes.md,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
  });
};