import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createThemedStyles } from '@/constants/theme';
import { router } from 'expo-router';
import { User, Mail, Phone, Save, ArrowLeft } from 'lucide-react-native';
import { updateUserProfile } from '../services/userService';
import { auth } from '../config/firebase';

export default function ProfileEditScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { user } = useAuth();
  const styles = createThemedStyles(theme);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};

    if (!name.trim()) newErrors.name = 'Name is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setIsLoading(true);

    try {
      // Update Firebase Auth profile
      const currentUser = auth().currentUser;
      if (currentUser) {
        await currentUser.updateProfile({
          displayName: name
        });
      }

      // Update Firestore user document
      await updateUserProfile(user.id, {
        displayName: name,
        phone: phone || null
      });

      Alert.alert(
        "Success",
        "Profile updated successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={profileStyles.header}>
        <TouchableOpacity
          style={profileStyles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, profileStyles.headerTitle]}>{t('editProfile')}</Text>
        <View style={profileStyles.placeholder} />
      </View>

      <ScrollView
        style={profileStyles.scrollView}
        contentContainerStyle={profileStyles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={profileStyles.avatarContainer}>
          <Image
            source={{
              uri: user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name || 'User')
            }}
            style={profileStyles.avatar}
          />
          <TouchableOpacity style={[profileStyles.changeAvatarButton, { backgroundColor: theme.colors.primary[500] }]}>
            <Text style={profileStyles.changeAvatarText}>{t('change')}</Text>
          </TouchableOpacity>
        </View>

        <View style={profileStyles.formContainer}>
          <View style={profileStyles.inputContainer}>
            <View style={profileStyles.inputLabel}>
              <User size={20} color={theme.colors.text} />
              <Text style={styles.text}>{t('name')}</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                errors.name && { borderColor: theme.colors.error[500] }
              ]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (errors.name && text.trim()) {
                  const newErrors = {...errors};
                  delete newErrors.name;
                  setErrors(newErrors);
                }
              }}
              placeholder={t('enterName')}
              placeholderTextColor={theme.colors.secondaryText}
            />
            {errors.name && (
              <Text style={[profileStyles.errorText, { color: theme.colors.error[500] }]}>
                {errors.name}
              </Text>
            )}
          </View>

          <View style={profileStyles.inputContainer}>
            <View style={profileStyles.inputLabel}>
              <Mail size={20} color={theme.colors.text} />
              <Text style={styles.text}>{t('email')}</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: theme.colors.surfaceVariant },
                errors.email && { borderColor: theme.colors.error[500] }
              ]}
              value={email}
              editable={false}
              placeholder={t('enterEmail')}
              placeholderTextColor={theme.colors.secondaryText}
            />
            {errors.email && (
              <Text style={[profileStyles.errorText, { color: theme.colors.error[500] }]}>
                {errors.email}
              </Text>
            )}
          </View>

          <View style={profileStyles.inputContainer}>
            <View style={profileStyles.inputLabel}>
              <Phone size={20} color={theme.colors.text} />
              <Text style={styles.text}>{t('phone')}</Text>
            </View>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('enterPhone')}
              placeholderTextColor={theme.colors.secondaryText}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </ScrollView>

      <View style={[profileStyles.footer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity
          style={[styles.button, profileStyles.saveButton, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <>
              <Save size={20} color={theme.colors.white} />
              <Text style={[styles.buttonText, { marginLeft: 8 }]}>{t('saveChanges')}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    textAlign: 'center',
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  changeAvatarButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  changeAvatarText: {
    color: 'white',
    fontWeight: '500',
  },
  formContainer: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  saveButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
