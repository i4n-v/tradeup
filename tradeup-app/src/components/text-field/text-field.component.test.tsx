import React from 'react';
import { Text, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { useForm, FormProvider } from 'react-hook-form';

import { TextField } from './text-field.component';

function FieldHost(props: { defaultValue?: string; left?: boolean; right?: boolean }) {
  const methods = useForm<{ email: string }>({
    defaultValues: { email: props.defaultValue ?? '' },
  });

  return (
    <FormProvider {...methods}>
      <TextField
        name="email"
        control={methods.control}
        label="E-mail"
        leftAdornment={
          props.left ? (
            <View testID="left-adornment">
              <Text>L</Text>
            </View>
          ) : undefined
        }
        rightAdornment={
          props.right ? (
            <View testID="right-adornment">
              <Text>R</Text>
            </View>
          ) : undefined
        }
      />
    </FormProvider>
  );
}

describe('TextField', () => {
  it('should render label and input', () => {
    render(<FieldHost defaultValue="a@b.com" />);

    expect(screen.getByText('E-mail')).toBeTruthy();
    expect(screen.getByDisplayValue('a@b.com')).toBeTruthy();
  });

  it('should render leftAdornment when provided', () => {
    render(<FieldHost left />);

    expect(screen.getByTestId('left-adornment')).toBeTruthy();
  });

  it('should render rightAdornment when provided', () => {
    render(<FieldHost right />);

    expect(screen.getByTestId('right-adornment')).toBeTruthy();
  });
});
