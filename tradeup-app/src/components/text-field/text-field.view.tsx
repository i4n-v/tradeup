import React from 'react';
import { Text, TextInput, View } from 'react-native';
import type { FieldValues } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import { cn } from '@/lib/utils/cn/cn.util';

import { textFieldContainerVariants, textFieldInputClassName } from './text-field.variants';

import type { ITextFieldViewProps } from './text-field.model';

function inputHorizontalPaddingClassName(
  hasLeftAdornment: boolean,
  hasRightAdornment: boolean,
): string {
  if (hasLeftAdornment && hasRightAdornment) {
    return 'pl-1 pr-1';
  }
  if (hasLeftAdornment) {
    return 'pl-1 pr-4';
  }
  if (hasRightAdornment) {
    return 'pl-4 pr-1';
  }
  return 'px-4';
}

function TextFieldView<T extends FieldValues>({
  name,
  control,
  label,
  leftAdornment,
  rightAdornment,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true,
  className,
  focused,
  onFocusChange,
}: ITextFieldViewProps<T>) {
  const hasLeft = !!leftAdornment;
  const hasRight = !!rightAdornment;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value, ref }, fieldState: { error } }) => (
        <View className={cn('gap-1', className)}>
          <Text className="text-sm font-primary-medium text-gray-700">{label}</Text>
          <View className={textFieldContainerVariants({ focused, error: !!error })} accessible={false}>
            {hasLeft ? (
              <View accessible={false} className="justify-center pl-3">
                {leftAdornment}
              </View>
            ) : null}
            <TextInput
              ref={ref}
              value={value}
              onChangeText={onChange}
              onFocus={() => onFocusChange(true)}
              onBlur={() => {
                onFocusChange(false);
                onBlur();
              }}
              placeholder={placeholder}
              secureTextEntry={secureTextEntry}
              keyboardType={keyboardType}
              autoCapitalize={autoCapitalize}
              autoCorrect={autoCorrect}
              editable={editable}
              accessibilityLabel={label}
              className={cn(
                textFieldInputClassName,
                inputHorizontalPaddingClassName(hasLeft, hasRight),
              )}
            />
            {hasRight ? (
              <View accessible={false} className="justify-center pr-3">
                {rightAdornment}
              </View>
            ) : null}
          </View>
          {error && (
            <Text className="text-sm font-secondary-medium text-red-500">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
}

export { TextFieldView };
