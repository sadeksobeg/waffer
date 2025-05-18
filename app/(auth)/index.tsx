import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Switch, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { Mail, Lock, EyeOff, Eye } from 'lucide-react-native';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { t, changeLanguage, locale } = useLanguage();
  const { login, isLoading } = useAuth();
  const styles = createThemedStyles(theme);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage(t('loginFailed'));
      return;
    }

    try {
      setErrorMessage('');
      await login(email, password);
    } catch (error) {
      setErrorMessage(t('loginFailed'));
    }
  };

  const toggleLanguage = () => {
    changeLanguage(locale === 'en' ? 'ar' : 'en');
  };

  return (
    <ScrollView 
      style={[styles.container, loginStyles.scrollContainer]}
      contentContainerStyle={loginStyles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <View style={loginStyles.languageToggle}>
        <TouchableOpacity 
          style={[
            loginStyles.languageButton, 
            locale === 'en' && loginStyles.activeLanguage,
            { backgroundColor: locale === 'en' ? theme.colors.primary[500] : theme.colors.surfaceVariant }
          ]} 
          onPress={() => changeLanguage('en')}
        >
          <Text style={[
            loginStyles.languageText, 
            { color: locale === 'en' ? theme.colors.white : theme.colors.text }
          ]}>English</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            loginStyles.languageButton, 
            locale === 'ar' && loginStyles.activeLanguage,
            { backgroundColor: locale === 'ar' ? theme.colors.primary[500] : theme.colors.surfaceVariant }
          ]} 
          onPress={() => changeLanguage('ar')}
        >
          <Text style={[
            loginStyles.languageText, 
            { color: locale === 'ar' ? theme.colors.white : theme.colors.text }
          ]}>العربية</Text>
        </TouchableOpacity>
      </View>

      <View style={loginStyles.logoContainer}>
        <Image 
          source={{ uri: 'https://images.pexels.com/photos/6034158/pexels-photo-6034158.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940' }} 
          style={loginStyles.logo} 
          resizeMode="contain"
        />
        <Text style={[styles.title, loginStyles.appName]}>CouponHub</Text>
      </View>

      <Text style={styles.title}>{t('login')}</Text>
      
      {errorMessage ? (
        <View style={[loginStyles.errorContainer, { backgroundColor: theme.colors.error[100] }]}>
          <Text style={[loginStyles.errorText, { color: theme.colors.error[700] }]}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={loginStyles.inputContainer}>
        <Mail size={20} color={theme.colors.secondaryText} style={loginStyles.inputIcon} />
        <TextInput
          style={[styles.input, loginStyles.input, { borderColor: theme.colors.border }]}
          placeholder={t('email')}
          placeholderTextColor={theme.colors.secondaryText}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={loginStyles.inputContainer}>
        <Lock size={20} color={theme.colors.secondaryText} style={loginStyles.inputIcon} />
        <TextInput
          style={[styles.input, loginStyles.input, { borderColor: theme.colors.border, flex: 1 }]}
          placeholder={t('password')}
          placeholderTextColor={theme.colors.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity 
          style={loginStyles.passwordToggle} 
          onPress={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <EyeOff size={20} color={theme.colors.secondaryText} />
          ) : (
            <Eye size={20} color={theme.colors.secondaryText} />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity>
        <Text style={[styles.secondaryText, loginStyles.forgotPassword, { color: theme.colors.primary[600] }]}>
          {t('forgotPassword')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, loginStyles.loginButton, { opacity: isLoading ? 0.7 : 1 }]} 
        onPress={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.buttonText}>{t('signIn')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.text}>{t('dontHaveAccount')} </Text>
        <Link href="/register" asChild>
          <TouchableOpacity>
            <Text style={[loginStyles.registerLink, { color: theme.colors.primary[600] }]}>
              {t('signUp')}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>

      <View style={loginStyles.demoAccounts}>
        <Text style={[styles.secondaryText, loginStyles.demoTitle]}>Demo Accounts:</Text>
        <TouchableOpacity 
          style={loginStyles.demoButton} 
          onPress={() => {
            setEmail('customer@example.com');
            setPassword('password');
          }}
        >
          <Text style={[styles.secondaryText, { color: theme.colors.primary[600] }]}>Customer</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={loginStyles.demoButton} 
          onPress={() => {
            setEmail('merchant@example.com');
            setPassword('password');
          }}
        >
          <Text style={[styles.secondaryText, { color: theme.colors.primary[600] }]}>Merchant</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={loginStyles.demoButton} 
          onPress={() => {
            setEmail('admin@example.com');
            setPassword('password');
          }}
        >
          <Text style={[styles.secondaryText, { color: theme.colors.primary[600] }]}>Admin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const loginStyles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  appName: {
    marginTop: 10,
    fontSize: 28,
  },
  inputContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingLeft: 40,
    borderWidth: 1,
    marginBottom: 0,
  },
  inputIcon: {
    position: 'absolute',
    left: 12,
    zIndex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    width: '100%',
    marginBottom: 24,
  },
  registerLink: {
    fontWeight: 'bold',
  },
  errorContainer: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
  },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    zIndex: 1,
  },
  languageToggle: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    overflow: 'hidden',
  },
  languageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activeLanguage: {
    fontWeight: 'bold',
  },
  languageText: {
    fontWeight: '500',
  },
  demoAccounts: {
    marginTop: 40,
    alignItems: 'center',
  },
  demoTitle: {
    marginBottom: 8,
  },
  demoButton: {
    paddingVertical: 8,
  },
});