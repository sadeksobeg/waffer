import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { X, CheckCircle, Calendar, Clock, AlertTriangle } from 'lucide-react-native';
import QRCode from '@/components/common/QRCode';

interface Coupon {
  id: string;
  title: string;
  description: string;
  discount: string;
  merchant: {
    id: string;
    name: string;
    image: string;
  };
  category: string;
  expiryDate: string;
  code: string;
}

interface CouponRedeemModalProps {
  isVisible: boolean;
  coupon: Coupon;
  onClose: () => void;
  onRedeem: () => void;
}

export default function CouponRedeemModal({ isVisible, coupon, onClose, onRedeem }: CouponRedeemModalProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createThemedStyles(theme);
  
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isExpired = new Date(coupon.expiryDate) < new Date();
  
  const handleRedeem = async () => {
    if (isExpired) {
      setError('This coupon has expired');
      return;
    }
    
    try {
      setIsRedeeming(true);
      setError(null);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsRedeemed(true);
      onRedeem();
    } catch (err) {
      setError('Failed to redeem coupon. Please try again.');
    } finally {
      setIsRedeeming(false);
    }
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[redeemModalStyles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View 
          style={[
            redeemModalStyles.modalContainer, 
            styles.shadow, 
            { backgroundColor: theme.colors.card }
          ]}
        >
          <TouchableOpacity 
            style={redeemModalStyles.closeButton} 
            onPress={onClose}
            disabled={isRedeeming}
          >
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          {isRedeemed ? (
            <View style={redeemModalStyles.successContainer}>
              <CheckCircle size={80} color={theme.colors.success[500]} />
              <Text style={[styles.title, redeemModalStyles.successTitle]}>Success!</Text>
              <Text style={[styles.text, redeemModalStyles.successText]}>
                Coupon successfully redeemed. You've earned points for this redemption!
              </Text>
              
              <TouchableOpacity 
                style={[
                  styles.button, 
                  redeemModalStyles.doneButton, 
                  { backgroundColor: theme.colors.primary[500] }
                ]} 
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={redeemModalStyles.couponHeader}>
                <Image 
                  source={{ uri: coupon.merchant.image }} 
                  style={redeemModalStyles.merchantLogo} 
                />
                <View style={redeemModalStyles.merchantInfo}>
                  <Text style={[styles.text, redeemModalStyles.merchantName]}>{coupon.merchant.name}</Text>
                  <Text style={[styles.title, redeemModalStyles.couponTitle]}>{coupon.title}</Text>
                </View>
              </View>
              
              <View style={redeemModalStyles.couponDetails}>
                <View style={[redeemModalStyles.discountBadge, { backgroundColor: theme.colors.primary[500] }]}>
                  <Text style={redeemModalStyles.discountText}>{coupon.discount}% OFF</Text>
                </View>
                
                <Text style={[styles.text, redeemModalStyles.description]}>{coupon.description}</Text>
                
                <View style={redeemModalStyles.detailsRow}>
                  <View style={redeemModalStyles.detailItem}>
                    <Calendar size={16} color={theme.colors.secondaryText} />
                    <Text style={[styles.secondaryText, redeemModalStyles.detailText]}>
                      Valid until {new Date(coupon.expiryDate).toLocaleDateString()}
                    </Text>
                  </View>
                  
                  <View style={redeemModalStyles.detailItem}>
                    <Clock size={16} color={theme.colors.secondaryText} />
                    <Text style={[styles.secondaryText, redeemModalStyles.detailText]}>
                      Code: {coupon.code}
                    </Text>
                  </View>
                </View>
                
                {isExpired && (
                  <View style={[redeemModalStyles.errorContainer, { backgroundColor: theme.colors.error[100] }]}>
                    <AlertTriangle size={20} color={theme.colors.error[700]} />
                    <Text style={[redeemModalStyles.errorText, { color: theme.colors.error[700] }]}>
                      This coupon has expired
                    </Text>
                  </View>
                )}
                
                {error && !isExpired && (
                  <View style={[redeemModalStyles.errorContainer, { backgroundColor: theme.colors.error[100] }]}>
                    <AlertTriangle size={20} color={theme.colors.error[700]} />
                    <Text style={[redeemModalStyles.errorText, { color: theme.colors.error[700] }]}>
                      {error}
                    </Text>
                  </View>
                )}
                
                <View style={redeemModalStyles.qrContainer}>
                  <Text style={[styles.subtitle, redeemModalStyles.qrTitle]}>Show this to merchant</Text>
                  <QRCode value={JSON.stringify({ couponId: coupon.id })} size={200} />
                </View>
                
                <TouchableOpacity 
                  style={[
                    styles.button, 
                    redeemModalStyles.redeemButton, 
                    { 
                      backgroundColor: isExpired ? theme.colors.neutral[400] : theme.colors.primary[500],
                      opacity: isRedeeming ? 0.7 : 1
                    }
                  ]} 
                  onPress={handleRedeem}
                  disabled={isRedeeming || isExpired}
                >
                  {isRedeeming ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>{t('redeemCoupon')}</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const redeemModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 10,
    padding: 4,
  },
  couponHeader: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  merchantLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  merchantInfo: {
    alignItems: 'center',
  },
  merchantName: {
    fontSize: 14,
    marginBottom: 4,
  },
  couponTitle: {
    textAlign: 'center',
    marginBottom: 0,
  },
  couponDetails: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  discountBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  discountText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 4,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  qrTitle: {
    marginBottom: 12,
  },
  redeemButton: {
    width: '100%',
    paddingVertical: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    marginLeft: 8,
    flex: 1,
  },
  successContainer: {
    padding: 24,
    alignItems: 'center',
  },
  successTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  successText: {
    textAlign: 'center',
    marginBottom: 24,
  },
  doneButton: {
    width: '100%',
    paddingVertical: 16,
  },
});