import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface CategoryListProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
  containerStyle?: object;
}

export default function CategoryList({ categories, onCategoryPress, containerStyle }: CategoryListProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity 
      style={[categoryListStyles.categoryItem, { backgroundColor: theme.colors.surfaceVariant }]} 
      onPress={() => onCategoryPress && onCategoryPress(item)}
    >
      <View style={[categoryListStyles.iconContainer, { backgroundColor: theme.colors.primary[50] }]}>
        {item.icon}
      </View>
      <Text style={[styles.text, categoryListStyles.categoryName]} numberOfLines={1}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={containerStyle}>
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
}

const categoryListStyles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    marginRight: 12,
    padding: 12,
    borderRadius: 12,
    width: 90,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    textAlign: 'center',
  },
});