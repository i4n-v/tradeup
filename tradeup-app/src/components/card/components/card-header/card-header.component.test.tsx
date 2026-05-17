import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { CardHeader } from './card-header.component';

describe('CardHeader', () => {
  it('should render children', () => {
    render(
      <CardHeader>
        <Text>Title</Text>
      </CardHeader>,
    );

    expect(screen.getByText('Title')).toBeTruthy();
  });
});
