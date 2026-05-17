import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { CardRoot } from './card-root.component';

describe('CardRoot', () => {
  it('should render children', () => {
    render(
      <CardRoot>
        <Text>Card content</Text>
      </CardRoot>,
    );

    expect(screen.getByText('Card content')).toBeTruthy();
  });
});
