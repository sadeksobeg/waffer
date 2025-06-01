import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Svg, { Path, Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

interface WafferLogoProps {
  size?: number;
  animated?: boolean;
  style?: any;
  showAnimation?: boolean;
}

export default function WafferLogo({
  size = 120,
  animated = true,
  style,
  showAnimation = true
}: WafferLogoProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showAnimation) {
      // Initial entrance animation
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
        // Subtle rotation animation
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous pulse animation
      if (animated) {
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 2000,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();
        return () => pulseAnimation.stop();
      }
    } else {
      // No animation - just show immediately
      scaleAnim.setValue(1);
      fadeAnim.setValue(1);
      rotateAnim.setValue(1);
    }
  }, [animated, showAnimation]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const AnimatedSvg = Animated.createAnimatedComponent(Svg);

  return (
    <View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Animated.View
        style={{
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
            { rotate: animated ? rotate : '0deg' },
          ],
          opacity: fadeAnim,
        }}
      >
        <AnimatedSvg
          width={size}
          height={size}
          viewBox="0 0 120 120"
          style={{
            shadowColor: '#06b6d4',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Defs>
            <RadialGradient id="logoGradient" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#06b6d4" stopOpacity="1" />
              <Stop offset="50%" stopColor="#3b82f6" stopOpacity="1" />
              <Stop offset="100%" stopColor="#1e3a8a" stopOpacity="1" />
            </RadialGradient>
          </Defs>

          {/* Beautiful Background Circle */}
          <Circle
            cx="60"
            cy="60"
            r="56"
            fill="url(#logoGradient)"
            stroke="#ffffff"
            strokeWidth="2"
          />

          {/* Decorative Cyan Dots - Matching Original Design */}
          <Circle cx="25" cy="30" r="3" fill="#06b6d4" opacity="0.8" />
          <Circle cx="95" cy="30" r="2.5" fill="#06b6d4" opacity="0.6" />
          <Circle cx="30" cy="90" r="2" fill="#06b6d4" opacity="0.7" />
          <Circle cx="90" cy="90" r="3.5" fill="#06b6d4" opacity="0.9" />

          {/* Sparkle Effects */}
          <Path d="M20 20 L22 24 L26 22 L22 26 Z" fill="#ffffff" opacity="0.8" />
          <Path d="M100 20 L102 24 L106 22 L102 26 Z" fill="#ffffff" opacity="0.6" />
          <Path d="M20 100 L22 104 L26 102 L22 106 Z" fill="#ffffff" opacity="0.7" />
        </AnimatedSvg>

        {/* Arabic Text Overlay - Beautiful Typography */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: size * 0.35,
            fontWeight: 'bold',
            color: '#ffffff',
            textAlign: 'center',
            fontFamily: 'Arial',
            textShadowColor: 'rgba(0,0,0,0.3)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
          }}>
            وفر
          </Text>
        </View>
      </Animated.View>
    </View>
  );
}
