import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import WafferLogo from './WafferLogo';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onAnimationComplete }: SplashScreenProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const logoTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      // Logo entrance and text fade in
      Animated.parallel([
        Animated.timing(textFadeAnim, {
          toValue: 1,
          duration: 1000,
          delay: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoTranslateY, {
          toValue: -20,
          tension: 50,
          friction: 8,
          delay: 800,
          useNativeDriver: true,
        }),
      ]),
      // Hold for a moment
      Animated.delay(1500),
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(() => {
      onAnimationComplete?.();
    });

    return () => animationSequence.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        opacity: fadeAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <StatusBar hidden />
      <LinearGradient
        colors={[
          theme.colors.primary[50],
          theme.colors.primary[100],
          theme.colors.primary[200],
        ]}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Background decorative elements */}
        <View
          style={{
            position: 'absolute',
            top: height * 0.1,
            right: width * 0.1,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: theme.colors.primary[200],
            opacity: 0.3,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: height * 0.2,
            left: width * 0.1,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: theme.colors.primary[300],
            opacity: 0.2,
          }}
        />

        {/* Main content */}
        <Animated.View
          style={{
            alignItems: 'center',
            transform: [{ translateY: logoTranslateY }],
          }}
        >
          {/* Logo */}
          <WafferLogo 
            size={180} 
            animated={true} 
            showAnimation={true}
            style={{
              marginBottom: 30,
              shadowColor: theme.colors.primary[500],
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.3,
              shadowRadius: 20,
              elevation: 15,
            }}
          />

          {/* App name and tagline */}
          <Animated.View
            style={{
              opacity: textFadeAnim,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: theme.colors.text,
                marginBottom: 8,
                textAlign: 'center',
                letterSpacing: 2,
              }}
            >
              Waffer
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: theme.colors.textSecondary,
                textAlign: 'center',
                opacity: 0.8,
                fontWeight: '300',
                letterSpacing: 1,
              }}
            >
              {t('save_more_spend_less') || 'Save More, Spend Less'}
            </Text>
          </Animated.View>
        </Animated.View>

        {/* Loading indicator */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: height * 0.15,
            opacity: textFadeAnim,
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: theme.colors.primary[300],
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Animated.View
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: theme.colors.primary[500],
                borderRadius: 2,
                transform: [
                  {
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-40, 0],
                    }),
                  },
                ],
              }}
            />
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}
