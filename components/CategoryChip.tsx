import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface CategoryChipProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  title,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className={`px-5 py-2.5 rounded-full mr-2.5 flex-row items-center border ${
        active
          ? 'bg-spiritual-saffron border-spiritual-saffron shadow-sm'
          : 'bg-white dark:bg-spiritual-surfaceDark border-gray-100 dark:border-neutral-800'
      }`}
    >
      <Text
        className={`text-xs font-semibold tracking-wider ${
          active
            ? 'text-white'
            : 'text-spiritual-charcoal dark:text-neutral-300'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
};
export default CategoryChip;
