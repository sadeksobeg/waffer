import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nManager, Platform } from 'react-native';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold
} from '@expo-google-fonts/inter';
import { SplashScreen } from 'expo-router';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import CustomSplashScreen from '@/components/ui/SplashScreen';

// Debug logging to see what platform is detected
console.log('Platform.OS detected:', Platform.OS);
console.log('Running on native platform - showing full app');

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showCustomSplash, setShowCustomSplash] = useState(true);

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Set app as ready and hide expo splash screen
      setAppIsReady(true);
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleCustomSplashComplete = () => {
    setShowCustomSplash(false);
  };

  if (!appIsReady) {
    return null;
  }

  // Show full app
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(merchant)" options={{ headerShown: false }} />
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />

          {/* Custom Splash Screen with Waffer Logo */}
          {showCustomSplash && (
            <CustomSplashScreen onAnimationComplete={handleCustomSplashComplete} />
          )}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}