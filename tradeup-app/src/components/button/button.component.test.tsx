import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './button.component';

describe('Button', () => {
  it('should invoke onPress when Button.Root is pressed', () => {
    const onPress = jest.fn();

    render(
      <Button.Root onPress={onPress} accessibilityLabel="Submit action">
        <Button.Text>OK</Button.Text>
      </Button.Root>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Submit action' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should not call onPress when loading', () => {
    const onPress = jest.fn();

    render(
      <Button.Root onPress={onPress} loading accessibilityLabel="Loading action">
        <Button.Text>OK</Button.Text>
      </Button.Root>,
    );

    fireEvent.press(screen.getByRole('button', { name: 'Loading action' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
