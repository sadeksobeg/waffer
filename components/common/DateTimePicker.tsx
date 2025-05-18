import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal,
  Platform
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import DateTimePickerNative from '@react-native-community/datetimepicker';
import { Calendar, Clock } from 'lucide-react-native';

interface DateTimePickerProps {
  isVisible: boolean;
  date: Date;
  mode: 'date' | 'time' | 'datetime';
  onConfirm: (date: Date | null) => void;
  onCancel: () => void;
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DateTimePicker({ 
  isVisible, 
  date, 
  mode, 
  onConfirm, 
  onCancel,
  minimumDate,
  maximumDate
}: DateTimePickerProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  const [selectedDate, setSelectedDate] = React.useState(date);
  
  // Reset selected date when modal opens
  React.useEffect(() => {
    if (isVisible) {
      setSelectedDate(date);
    }
  }, [isVisible, date]);
  
  const handleChange = (_: any, newDate?: Date) => {
    if (Platform.OS === 'android') {
      if (newDate) {
        setSelectedDate(newDate);
        onConfirm(newDate);
      } else {
        onCancel();
      }
    } else {
      if (newDate) {
        setSelectedDate(newDate);
      }
    }
  };
  
  const handleConfirm = () => {
    onConfirm(selectedDate);
  };
  
  // Web implementation
  if (Platform.OS === 'web') {
    const handleWebChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newDate = e.target.value ? new Date(e.target.value) : null;
      setSelectedDate(newDate || date);
    };
    
    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
        onRequestClose={onCancel}
      >
        <View style={[datePickerStyles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View 
            style={[
              datePickerStyles.container, 
              styles.shadow, 
              { backgroundColor: theme.colors.card }
            ]}
          >
            <View style={datePickerStyles.header}>
              <Text style={styles.subtitle}>
                {mode === 'date' ? 'Select Date' : mode === 'time' ? 'Select Time' : 'Select Date & Time'}
              </Text>
            </View>
            
            <View style={datePickerStyles.webPickerContainer}>
              {(mode === 'date' || mode === 'datetime') && (
                <View style={datePickerStyles.webInputContainer}>
                  <Calendar size={20} color={theme.colors.primary[500]} style={datePickerStyles.webIcon} />
                  <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={handleWebChange}
                    style={{
                      fontSize: 16,
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceVariant,
                      width: '100%',
                    }}
                    min={minimumDate ? minimumDate.toISOString().split('T')[0] : undefined}
                    max={maximumDate ? maximumDate.toISOString().split('T')[0] : undefined}
                  />
                </View>
              )}
              
              {(mode === 'time' || mode === 'datetime') && (
                <View style={datePickerStyles.webInputContainer}>
                  <Clock size={20} color={theme.colors.primary[500]} style={datePickerStyles.webIcon} />
                  <input
                    type="time"
                    value={selectedDate.toTimeString().slice(0, 5)}
                    onChange={handleWebChange}
                    style={{
                      fontSize: 16,
                      padding: 12,
                      borderRadius: 8,
                      border: `1px solid ${theme.colors.border}`,
                      color: theme.colors.text,
                      backgroundColor: theme.colors.surfaceVariant,
                      width: '100%',
                    }}
                  />
                </View>
              )}
            </View>
            
            <View style={datePickerStyles.actions}>
              <TouchableOpacity 
                style={[
                  styles.secondaryButton, 
                  datePickerStyles.cancelButton,
                  { borderColor: theme.colors.border }
                ]} 
                onPress={onCancel}
              >
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.button, 
                  datePickerStyles.confirmButton,
                  { backgroundColor: theme.colors.primary[500] }
                ]} 
                onPress={handleConfirm}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
  
  // iOS implementation
  if (Platform.OS === 'ios') {
    return (
      <Modal
        visible={isVisible}
        transparent
        animationType="slide"
        onRequestClose={onCancel}
      >
        <View style={[datePickerStyles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View 
            style={[
              datePickerStyles.iosContainer, 
              { backgroundColor: theme.colors.card }
            ]}
          >
            <View style={datePickerStyles.iosHeader}>
              <TouchableOpacity onPress={onCancel}>
                <Text style={[styles.text, { color: theme.colors.primary[600] }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={handleConfirm}>
                <Text style={[styles.text, { color: theme.colors.primary[600], fontWeight: '600' }]}>Done</Text>
              </TouchableOpacity>
            </View>
            
            <DateTimePickerNative
              value={selectedDate}
              mode={mode}
              display="spinner"
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
          </View>
        </View>
      </Modal>
    );
  }
  
  // Android implementation
  return isVisible ? (
    <DateTimePickerNative
      value={selectedDate}
      mode={mode}
      display="default"
      onChange={handleChange}
      minimumDate={minimumDate}
      maximumDate={maximumDate}
    />
  ) : null;
}

const datePickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
  },
  webPickerContainer: {
    padding: 16,
  },
  webInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  webIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
    zIndex: 1,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  confirmButton: {
    flex: 2,
  },
  iosContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  iosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
});