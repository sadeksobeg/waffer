import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { createThemedStyles } from '@/constants/theme';
import { Search, X } from 'lucide-react-native';

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSubmit?: () => void;
}

export default function SearchBar({ placeholder, value, onChangeText, onSubmit }: SearchBarProps) {
  const { theme } = useTheme();
  const styles = createThemedStyles(theme);
  
  return (
    <View style={[searchBarStyles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <Search size={20} color={theme.colors.secondaryText} style={searchBarStyles.searchIcon} />
      
      <TextInput
        style={[styles.text, searchBarStyles.input, { color: theme.colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.secondaryText}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
      />
      
      {value && value.length > 0 && (
        <TouchableOpacity 
          style={searchBarStyles.clearButton}
          onPress={() => onChangeText && onChangeText('')}
        >
          <X size={16} color={theme.colors.secondaryText} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const searchBarStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    position: 'relative',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
});