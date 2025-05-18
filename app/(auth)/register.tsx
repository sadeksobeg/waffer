import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { UserRole } from '@/contexts/AuthContext';
import { Mail, Lock, User, Store, KeyRound } from 'lucide-react-native';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { register, isLoading } = useAuth();
  const styles = createThemedStyles(theme);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage(t('registrationFailed'));
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      setErrorMessage('');
      await register(email, password, name, role);
    } catch (error) {
      setErrorMessage(t('registrationFailed'));
    }
  };

  return (
    <ScrollView 
      style={[styles.container, registerStyles.scrollContainer]}
      contentContainerStyle={registerStyles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{t('register')}</Text>
      
      {errorMessage ? (
        <View style={[registerStyles.errorContainer, { backgroundColor: theme.colors.error[100] }]}>
          <Text style={[registerStyles.errorText, { color: theme.colors.error[700] }]}>{errorMessage}</Text>
        </View>
      ) : null}

      <View style={registerStyles.inputContainer}>
        <User size={20} color={theme.colors.secondaryText} style={registerStyles.inputIcon} />
        <TextInput
          style={[styles.input, registerStyles.input, { borderColor: theme.colors.border }]}
          placeholder={t('fullName')}
          placeholderTextColor={theme.colors.secondaryText}
          value={name}
          onChangeText={setName}
        />
      </View>

      <View style={registerStyles.inputContainer}>
        <Mail size={20} color={theme.colors.secondaryText} style={registerStyles.inputIcon} />
        <TextInput
          style={[styles.input, registerStyles.input, { borderColor: theme.colors.border }]}
          placeholder={t('email')}
          placeholderTextColor={theme.colors.secondaryText}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={registerStyles.inputContainer}>
        <Lock size={20} color={theme.colors.secondaryText} style={registerStyles.inputIcon} />
        <TextInput
          style={[styles.input, registerStyles.input, { borderColor: theme.colors.border }]}
          placeholder={t('password')}
          placeholderTextColor={theme.colors.secondaryText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View style={registerStyles.inputContainer}>
        <KeyRound size={20} color={theme.colors.secondaryText} style={registerStyles.inputIcon} />
        <TextInput
          style={[styles.input, registerStyles.input, { borderColor: theme.colors.border }]}
          placeholder={t('confirmPassword')}
          placeholderTextColor={theme.colors.secondaryText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <Text style={[styles.subtitle, registerStyles.roleLabel]}>{t('userType')}</Text>
      
      <View style={registerStyles.roleContainer}>
        <TouchableOpacity 
          style={[
            registerStyles.roleButton,
            role === 'customer' && registerStyles.activeRoleButton,
            { 
              backgroundColor: role === 'customer' ? theme.colors.primary[500] : theme.colors.surfaceVariant,
              borderColor: role === 'customer' ? theme.colors.primary[600] : theme.colors.border
            }
          ]}
          onPress={() => setRole('customer')}
        >
          <User 
            size={24} 
            color={role === 'customer' ? theme.colors.white : theme.colors.text} 
            style={registerStyles.roleIcon} 
          />
          <Text style={[
            registerStyles.roleText,
            { color: role === 'customer' ? theme.colors.white : theme.colors.text }
          ]}>
            {t('customer')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            registerStyles.roleButton,
            role === 'merchant' && registerStyles.activeRoleButton,
            { 
              backgroundColor: role === 'merchant' ? theme.colors.primary[500] : theme.colors.surfaceVariant,
              borderColor: role === 'merchant' ? theme.colors.primary[600] : theme.colors.border
            }
          ]}
          onPress={() => setRole('merchant')}
        >
          <Store 
            size={24} 
            color={role === 'merchant' ? theme.colors.white : theme.colors.text} 
            style={registerStyles.roleIcon} 
          />
          <Text style={[
            registerStyles.roleText,
            { color: role === 'merchant' ? theme.colors.white : theme.colors.text }
          ]}>
            {t('merchant')}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, registerStyles.registerButton, { opacity: isLoading ? 0.7 : 1 }]} 
        onPress={handleRegister}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={theme.colors.white} />
        ) : (
          <Text style={styles.buttonText}>{t('signUp')}</Text>
        )}
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={styles.text}>{t('alreadyHaveAccount')} </Text>
        <Link href="/(auth)" asChild>
          <TouchableOpacity>
            <Text style={[registerStyles.loginLink, { color: theme.colors.primary[600] }]}>
              {t('signIn')}
            </Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const registerStyles = StyleSheet.create({
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
  registerButton: {
    width: '100%',
    marginTop: 16,
    marginBottom: 24,
  },
  loginLink: {
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
  roleLabel: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  roleContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  roleButton: {
    width: '48%',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  activeRoleButton: {
    borderWidth: 2,
  },
  roleIcon: {
    marginBottom: 8,
  },
  roleText: {
    fontWeight: '500',
    fontSize: 16,
  },
});