import React, { useState } from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  Switch
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { createThemedStyles } from '@/constants/theme';
import { X, Check } from 'lucide-react-native';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface FilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  categories: Category[];
  currentFilters: {
    categories: string[];
    sortBy: string;
    onlyActive: boolean;
  };
  onApply: (filters: any) => void;
}

export default function FilterModal({ isVisible, onClose, categories, currentFilters, onApply }: FilterModalProps) {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const styles = createThemedStyles(theme);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories);
  const [sortOption, setSortOption] = useState(currentFilters.sortBy);
  const [onlyActive, setOnlyActive] = useState(currentFilters.onlyActive);
  
  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };
  
  const handleApply = () => {
    onApply({
      categories: selectedCategories,
      sortBy: sortOption,
      onlyActive,
    });
    onClose();
  };
  
  const handleReset = () => {
    setSelectedCategories([]);
    setSortOption('newest');
    setOnlyActive(true);
  };
  
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[filterModalStyles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View 
          style={[
            filterModalStyles.modalContainer, 
            styles.shadow, 
            { 
              backgroundColor: theme.colors.card,
            }
          ]}
        >
          <View style={filterModalStyles.header}>
            <Text style={styles.subtitle}>{t('filter')}</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={filterModalStyles.content}>
            <View style={filterModalStyles.section}>
              <Text style={[styles.text, filterModalStyles.sectionTitle]}>{t('categories')}</Text>
              <View style={filterModalStyles.categoriesGrid}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      filterModalStyles.categoryItem,
                      selectedCategories.includes(category.id) && { 
                        backgroundColor: theme.colors.primary[50],
                        borderColor: theme.colors.primary[500],
                      },
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => handleCategoryToggle(category.id)}
                  >
                    <View style={filterModalStyles.categoryContent}>
                      <View style={filterModalStyles.categoryIcon}>
                        {category.icon}
                      </View>
                      <Text 
                        style={[
                          styles.text, 
                          { 
                            color: selectedCategories.includes(category.id) 
                              ? theme.colors.primary[700] 
                              : theme.colors.text 
                          }
                        ]}
                      >
                        {category.name}
                      </Text>
                    </View>
                    
                    {selectedCategories.includes(category.id) && (
                      <View style={[
                        filterModalStyles.checkmark, 
                        { backgroundColor: theme.colors.primary[500] }
                      ]}>
                        <Check size={12} color={theme.colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={filterModalStyles.section}>
              <Text style={[styles.text, filterModalStyles.sectionTitle]}>{t('sortBy')}</Text>
              <View style={filterModalStyles.sortOptions}>
                {[
                  { id: 'newest', label: 'Newest' },
                  { id: 'expiringSoon', label: 'Expiring Soon' },
                  { id: 'discount', label: 'Highest Discount' },
                ].map(option => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      filterModalStyles.sortOption,
                      sortOption === option.id && { 
                        backgroundColor: theme.colors.primary[500],
                      },
                      { borderColor: theme.colors.border }
                    ]}
                    onPress={() => setSortOption(option.id)}
                  >
                    <Text 
                      style={[
                        styles.text, 
                        { 
                          color: sortOption === option.id 
                            ? theme.colors.white 
                            : theme.colors.text 
                        }
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={filterModalStyles.section}>
              <View style={filterModalStyles.switchOption}>
                <Text style={styles.text}>Only Show Active Coupons</Text>
                <Switch
                  value={onlyActive}
                  onValueChange={setOnlyActive}
                  trackColor={{ false: theme.colors.neutral[300], true: theme.colors.primary[300] }}
                  thumbColor={onlyActive ? theme.colors.primary[500] : theme.colors.neutral[100]}
                />
              </View>
            </View>
          </ScrollView>
          
          <View style={filterModalStyles.footer}>
            <TouchableOpacity 
              style={[
                filterModalStyles.resetButton, 
                { 
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surfaceVariant
                }
              ]} 
              onPress={handleReset}
            >
              <Text style={[styles.text, { color: theme.colors.text }]}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                filterModalStyles.applyButton, 
                { backgroundColor: theme.colors.primary[500] }
              ]} 
              onPress={handleApply}
            >
              <Text style={[styles.text, { color: theme.colors.white }]}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const filterModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    marginRight: 8,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sortOption: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  switchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  applyButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});