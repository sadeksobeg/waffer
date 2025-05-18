import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  FlatList,
  SafeAreaView
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import { ChevronDown, ChevronUp, Check } from 'lucide-react-native';

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownSelectProps {
  placeholder: string;
  items: DropdownItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  hasError?: boolean;
}

export default function DropdownSelect({ 
  placeholder, 
  items, 
  selectedValue, 
  onValueChange,
  hasError = false
}: DropdownSelectProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedItem = items.find(item => item.value === selectedValue);
  
  return (
    <>
      <TouchableOpacity
        style={[
          styles.input,
          dropdownStyles.input,
          { borderColor: hasError ? theme.colors.error[500] : theme.colors.border },
        ]}
        onPress={() => setModalVisible(true)}
      >
        <Text 
          style={[
            selectedItem ? styles.text : styles.secondaryText,
            dropdownStyles.inputText,
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        
        {modalVisible ? (
          <ChevronUp size={20} color={theme.colors.secondaryText} />
        ) : (
          <ChevronDown size={20} color={theme.colors.secondaryText} />
        )}
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={[dropdownStyles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={[
              dropdownStyles.modalContent, 
              { 
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              }
            ]}
          >
            <SafeAreaView style={dropdownStyles.modalContentSafe}>
              <View style={dropdownStyles.modalHeader}>
                <Text style={styles.subtitle}>{placeholder}</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <ChevronDown size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={items}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      dropdownStyles.itemContainer,
                      item.value === selectedValue && { 
                        backgroundColor: theme.colors.primary[50] 
                      },
                      { borderBottomColor: theme.colors.border }
                    ]}
                    onPress={() => {
                      onValueChange(item.value);
                      setModalVisible(false);
                    }}
                  >
                    <Text 
                      style={[
                        styles.text, 
                        item.value === selectedValue && { 
                          color: theme.colors.primary[700],
                          fontWeight: '600'
                        }
                      ]}
                    >
                      {item.label}
                    </Text>
                    
                    {item.value === selectedValue && (
                      <Check size={20} color={theme.colors.primary[500]} />
                    )}
                  </TouchableOpacity>
                )}
              />
            </SafeAreaView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const dropdownStyles = StyleSheet.create({
  input: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalContentSafe: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
});