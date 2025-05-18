import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Switch,
  Image
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { router } from 'expo-router';
import { 
  X, 
  Calendar, 
  Type, 
  FileText, 
  Percent, 
  Tag, 
  AlertTriangle 
} from 'lucide-react-native';
import MerchantHeader from '@/components/merchant/MerchantHeader';
import DropdownSelect from '@/components/common/DropdownSelect';
import DateTimePicker from '@/components/common/DateTimePicker';
import { mockCategories } from '@/constants/mockData';

export default function CreateCouponScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createThemedStyles(theme);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discount, setDiscount] = useState('');
  const [category, setCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [usageLimit, setUsageLimit] = useState('1');
  const [isMultipleUse, setIsMultipleUse] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const validate = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!discount.trim()) newErrors.discount = 'Discount is required';
    else if (isNaN(Number(discount)) || Number(discount) <= 0) 
      newErrors.discount = 'Please enter a valid discount amount';
    
    if (!category) newErrors.category = 'Category is required';
    if (!expiryDate) newErrors.expiryDate = 'Expiry date is required';
    else if (expiryDate < new Date()) 
      newErrors.expiryDate = 'Expiry date must be in the future';
    
    if (isMultipleUse && (!usageLimit.trim() || isNaN(Number(usageLimit)) || Number(usageLimit) <= 0))
      newErrors.usageLimit = 'Please enter a valid usage limit';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.back();
    }, 1500);
  };

  const onDateChange = (date: Date | null) => {
    setExpiryDate(date);
    setShowDatePicker(false);
    if (date && errors.expiryDate) {
      const newErrors = {...errors};
      delete newErrors.expiryDate;
      setErrors(newErrors);
    }
  };

  return (
    <View style={styles.container}>
      <MerchantHeader 
        title={t('createCoupon')} 
        showBackButton 
        onBackPress={() => router.back()} 
      />
      
      <ScrollView 
        style={createCouponStyles.scrollView}
        contentContainerStyle={createCouponStyles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={createCouponStyles.formContainer}>
          <View style={createCouponStyles.inputContainer}>
            <View style={createCouponStyles.inputLabel}>
              <Type size={20} color={theme.colors.text} />
              <Text style={styles.text}>{t('couponTitle')}</Text>
            </View>
            <TextInput
              style={[
                styles.input, 
                errors.title && { borderColor: theme.colors.error[500] }
              ]}
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (errors.title && text.trim()) {
                  const newErrors = {...errors};
                  delete newErrors.title;
                  setErrors(newErrors);
                }
              }}
              placeholder="e.g. 20% OFF All Items"
              placeholderTextColor={theme.colors.secondaryText}
            />
            {errors.title && (
              <Text style={[createCouponStyles.errorText, { color: theme.colors.error[500] }]}>
                {errors.title}
              </Text>
            )}
          </View>
          
          <View style={createCouponStyles.inputContainer}>
            <View style={createCouponStyles.inputLabel}>
              <FileText size={20} color={theme.colors.text} />
              <Text style={styles.text}>{t('couponDescription')}</Text>
            </View>
            <TextInput
              style={[
                styles.input, 
                createCouponStyles.textarea, 
                errors.description && { borderColor: theme.colors.error[500] }
              ]}
              value={description}
              onChangeText={(text) => {
                setDescription(text);
                if (errors.description && text.trim()) {
                  const newErrors = {...errors};
                  delete newErrors.description;
                  setErrors(newErrors);
                }
              }}
              placeholder="Enter coupon description"
              placeholderTextColor={theme.colors.secondaryText}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {errors.description && (
              <Text style={[createCouponStyles.errorText, { color: theme.colors.error[500] }]}>
                {errors.description}
              </Text>
            )}
          </View>
          
          <View style={createCouponStyles.inputContainer}>
            <View style={createCouponStyles.inputLabel}>
              <Percent size={20} color={theme.colors.text} />
              <Text style={styles.text}>{t('discountAmount')}</Text>
            </View>
            <View style={createCouponStyles.discountContainer}>
              <TextInput
                style={[
                  styles.input,
                  createCouponStyles.discountInput,
                  errors.discount && { borderColor: theme.colors.error[500] }
                ]}
                value={discount}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setDiscount(numericText);
                  if (errors.discount && numericText.trim() && !isNaN(Number(numericText)) && Number(numericText) > 0) {
                    const newErrors = {...errors};
                    delete newErrors.discount;
                    setErrors(newErrors);
                  }
                }}
                placeholder="20"
                placeholderTextColor={theme.colors.secondaryText}
                keyboardType="numeric"
              />
              <Text style={[styles.text, createCouponStyles.percentSign]}>%</Text>
            </View>
            {errors.discount && (
              <Text style={[createCouponStyles.errorText, { color: theme.colors.error[500] }]}>
                {errors.discount}
              </Text>
            )}
          </View>
          
          <View style={createCouponStyles.inputContainer}>
            <View style={createCouponStyles.inputLabel}>
              <Tag size={20} color={theme.colors.text} />
              <Text style={styles.text}>{t('couponCategory')}</Text>
            </View>
            <DropdownSelect
              placeholder="Select category"
              items={mockCategories.map(cat => ({ label: cat.name, value: cat.id }))}
              selectedValue={category}
              onValueChange={(value) => {
                setCategory(value);
                if (errors.category && value) {
                  const newErrors = {...errors};
                  delete newErrors.category;
                  setErrors(newErrors);
                }
              }}
              hasError={!!errors.category}
            />
            {errors.category && (
              <Text style={[createCouponStyles.errorText, { color: theme.colors.error[500] }]}>
                {errors.category}
              </Text>
            )}
          </View>
          
          <View style={createCouponStyles.inputContainer}>
            <View style={createCouponStyles.inputLabel}>
              <Calendar size={20} color={theme.colors.text} />
              <Text style={styles.text}>{t('expiryDate')}</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.input,
                createCouponStyles.dateInput,
                errors.expiryDate && { borderColor: theme.colors.error[500] }
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[
                expiryDate ? styles.text : styles.secondaryText
              ]}>
                {expiryDate 
                  ? expiryDate.toLocaleDateString() 
                  : 'Select expiry date'}
              </Text>
            </TouchableOpacity>
            {errors.expiryDate && (
              <Text style={[createCouponStyles.errorText, { color: theme.colors.error[500] }]}>
                {errors.expiryDate}
              </Text>
            )}
            
            <DateTimePicker
              isVisible={showDatePicker}
              date={expiryDate || new Date()}
              mode="date"
              minimumDate={new Date()}
              onConfirm={onDateChange}
              onCancel={() => setShowDatePicker(false)}
            />
          </View>
          
          <View style={createCouponStyles.switchContainer}>
            <Text style={styles.text}>Allow multiple uses per customer</Text>
            <Switch
              value={isMultipleUse}
              onValueChange={setIsMultipleUse}
              trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[300] }}
              thumbColor={isMultipleUse ? theme.colors.primary[500] : theme.colors.neutral[100]}
            />
          </View>
          
          {isMultipleUse && (
            <View style={createCouponStyles.inputContainer}>
              <View style={createCouponStyles.inputLabel}>
                <AlertTriangle size={20} color={theme.colors.text} />
                <Text style={styles.text}>{t('usageLimit')}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  errors.usageLimit && { borderColor: theme.colors.error[500] }
                ]}
                value={usageLimit}
                onChangeText={(text) => {
                  const numericText = text.replace(/[^0-9]/g, '');
                  setUsageLimit(numericText);
                  if (errors.usageLimit && numericText.trim() && !isNaN(Number(numericText)) && Number(numericText) > 0) {
                    const newErrors = {...errors};
                    delete newErrors.usageLimit;
                    setErrors(newErrors);
                  }
                }}
                placeholder="1"
                placeholderTextColor={theme.colors.secondaryText}
                keyboardType="numeric"
              />
              {errors.usageLimit && (
                <Text style={[createCouponStyles.errorText, { color: theme.colors.error[500] }]}>
                  {errors.usageLimit}
                </Text>
              )}
            </View>
          )}
          
          <View style={createCouponStyles.couponPreview}>
            <Text style={[styles.subtitle, createCouponStyles.previewTitle]}>Preview</Text>
            <View style={[createCouponStyles.previewCard, styles.shadow, { backgroundColor: theme.colors.card }]}>
              <View style={createCouponStyles.previewHeader}>
                <Image 
                  source={{ uri: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' }}
                  style={createCouponStyles.previewLogo}
                />
                <View style={createCouponStyles.previewHeaderText}>
                  <Text style={[styles.text, createCouponStyles.previewMerchant]}>Your Store Name</Text>
                  <Text style={[styles.secondaryText, createCouponStyles.previewCategory]}>
                    {category ? mockCategories.find(cat => cat.id === category)?.name : 'Category'}
                  </Text>
                </View>
                <View style={[createCouponStyles.discountBadge, { backgroundColor: theme.colors.primary[500] }]}>
                  <Text style={createCouponStyles.discountText}>{discount || '20'}%</Text>
                </View>
              </View>
              
              <View style={createCouponStyles.previewContent}>
                <Text style={[styles.subtitle, createCouponStyles.previewCouponTitle]}>
                  {title || 'Your Coupon Title'}
                </Text>
                <Text style={styles.secondaryText} numberOfLines={2}>
                  {description || 'Your coupon description will appear here.'}
                </Text>
              </View>
              
              <View style={[createCouponStyles.previewFooter, { borderTopColor: theme.colors.border }]}>
                <Text style={styles.secondaryText}>
                  Expires: {expiryDate ? expiryDate.toLocaleDateString() : 'Select date'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <View style={[createCouponStyles.footer, { backgroundColor: theme.colors.card }]}>
        <TouchableOpacity 
          style={[styles.secondaryButton, createCouponStyles.cancelButton]}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <X size={20} color={theme.colors.text} />
          <Text style={[styles.secondaryButtonText, { marginLeft: 8 }]}>{t('cancel')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, createCouponStyles.createButton, { opacity: isLoading ? 0.7 : 1 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text style={styles.buttonText}>{t('create')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createCouponStyles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
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
  textarea: {
    height: 100,
    paddingTop: 12,
  },
  discountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountInput: {
    flex: 1,
  },
  percentSign: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '600',
  },
  dateInput: {
    justifyContent: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButton: {
    flex: 2,
  },
  couponPreview: {
    marginTop: 16,
  },
  previewTitle: {
    marginBottom: 12,
  },
  previewCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  previewLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  previewHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  previewMerchant: {
    fontWeight: '600',
  },
  previewCategory: {
    fontSize: 12,
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewContent: {
    padding: 16,
    paddingTop: 0,
  },
  previewCouponTitle: {
    marginBottom: 8,
  },
  previewFooter: {
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'center',
  },
});