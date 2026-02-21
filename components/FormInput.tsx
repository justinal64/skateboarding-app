import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

import { COLORS } from '@/constants/AppTheme';

type FormInputProps = TextInputProps & {
  label: string;
};

/**
 * Reusable labeled form input matching the app's neon theme.
 * Replaces the duplicated label + TextInput pattern in auth screens.
 */
export default function FormInput({ label, ...inputProps }: FormInputProps) {
  return (
    <View className="mb-6">
      <Text className="text-sm mb-2 font-bold text-textDim tracking-widest">
        {label}
      </Text>
      <TextInput
        className="border border-border bg-card rounded-xl p-4 text-base text-text"
        placeholderTextColor={COLORS.textDim}
        {...inputProps}
      />
    </View>
  );
}
