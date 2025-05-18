import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { Camera, X, RotateCcw, Check, AlertTriangle } from 'lucide-react-native';
import CouponRedeemModal from '@/components/customer/CouponRedeemModal';
import { mockCoupons } from '@/constants/mockData';
import { Platform } from 'react-native';

export default function ScannerScreen() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createThemedStyles(theme);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [couponData, setCouponData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For web platform, we'll simulate the scanner
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (!isWeb) {
      (async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
      })();
    } else {
      // Automatically grant permission on web
      setHasPermission(true);
    }
  }, []);

  const handleScan = ({ data }: { data: string }) => {
    setScanned(true);
    setScanning(false);
    
    try {
      // Try to parse the QR code data
      const parsedData = JSON.parse(data);
      
      if (parsedData?.couponId) {
        // Find the coupon in our mock data
        const coupon = mockCoupons.find(c => c.id === parsedData.couponId);
        
        if (coupon) {
          setCouponData(coupon);
          setShowModal(true);
          setError(null);
        } else {
          setError('Invalid coupon code');
        }
      } else {
        setError('Invalid QR code');
      }
    } catch (e) {
      setError('Could not read QR code');
    }
  };

  // For web, simulate scanning after delay
  const simulateScan = () => {
    setScanning(true);
    setScanned(false);
    setError(null);
    
    // Simulate processing time
    setTimeout(() => {
      // Random pick a coupon
      const randomCoupon = mockCoupons[Math.floor(Math.random() * mockCoupons.length)];
      handleScan({ data: JSON.stringify({ couponId: randomCoupon.id }) });
    }, 2000);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary[500]} />
      </View>
    );
  }
  
  if (hasPermission === false) {
    return (
      <View style={[styles.centerContainer, scannerStyles.permissionContainer]}>
        <AlertTriangle size={48} color={theme.colors.warning[500]} style={scannerStyles.permissionIcon} />
        <Text style={[styles.title, scannerStyles.permissionTitle]}>Camera Access Required</Text>
        <Text style={styles.text}>
          Please grant camera access in your device settings to scan coupon QR codes.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, scannerStyles.container]}>
      <View style={scannerStyles.header}>
        <Text style={styles.title}>{t('scanQR')}</Text>
        <Text style={styles.text}>Scan a coupon QR code to redeem it</Text>
      </View>
      
      <View style={scannerStyles.scannerContainer}>
        {isWeb ? (
          // Web mockup of a scanner
          <View style={scannerStyles.webScanner}>
            {scanning ? (
              <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            ) : (
              <Camera size={64} color={theme.colors.primary[500]} />
            )}
          </View>
        ) : (
          // Actual barcode scanner for native
          !scanned && (
            <BarCodeScanner
              onBarCodeScanned={scanned ? undefined : handleScan}
              style={scannerStyles.scanner}
            />
          )
        )}
        
        {/* Scanner overlay */}
        <View style={scannerStyles.scannerOverlay}>
          <View style={scannerStyles.scannerCorner} />
          <View style={scannerStyles.scannerCorner} />
          <View style={scannerStyles.scannerCorner} />
          <View style={scannerStyles.scannerCorner} />
        </View>
      </View>
      
      {error && (
        <View style={[scannerStyles.errorContainer, { backgroundColor: theme.colors.error[100] }]}>
          <Text style={[scannerStyles.errorText, { color: theme.colors.error[700] }]}>{error}</Text>
        </View>
      )}
      
      <View style={scannerStyles.actionsContainer}>
        {isWeb ? (
          <TouchableOpacity 
            style={[
              scanning ? scannerStyles.cancelButton : scannerStyles.scanButton, 
              { 
                backgroundColor: scanning ? theme.colors.error[500] : theme.colors.primary[500],
              }
            ]} 
            onPress={scanning ? () => setScanning(false) : simulateScan}
          >
            {scanning ? (
              <>
                <X size={20} color={theme.colors.white} />
                <Text style={scannerStyles.buttonText}>Cancel</Text>
              </>
            ) : (
              <>
                <Camera size={20} color={theme.colors.white} />
                <Text style={scannerStyles.buttonText}>Simulate Scan</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          scanned && (
            <TouchableOpacity 
              style={[scannerStyles.scanButton, { backgroundColor: theme.colors.primary[500] }]} 
              onPress={() => setScanned(false)}
            >
              <RotateCcw size={20} color={theme.colors.white} />
              <Text style={scannerStyles.buttonText}>Scan Again</Text>
            </TouchableOpacity>
          )
        )}
      </View>
      
      {couponData && (
        <CouponRedeemModal 
          isVisible={showModal}
          coupon={couponData}
          onClose={() => {
            setShowModal(false);
            setCouponData(null);
          }}
          onRedeem={() => {
            // Handle redemption logic
            setShowModal(false);
            setCouponData(null);
          }}
        />
      )}
    </View>
  );
}

const scannerStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
  },
  scannerContainer: {
    width: 280,
    height: 280,
    overflow: 'hidden',
    borderRadius: 24,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 24,
  },
  scanner: {
    width: '100%',
    height: '100%',
  },
  webScanner: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'space-between',
  },
  scannerCorner: {
    width: 20,
    height: 20,
    borderColor: '#fff',
    position: 'absolute',
  },
  actionsContainer: {
    width: '100%',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorContainer: {
    width: '90%',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    textAlign: 'center',
    fontWeight: '500',
  },
  permissionContainer: {
    padding: 24,
  },
  permissionIcon: {
    marginBottom: 16,
  },
  permissionTitle: {
    marginBottom: 8,
  },
});