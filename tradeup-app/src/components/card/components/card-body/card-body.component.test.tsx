import React from 'react';
import { Text } from 'react-native';
import { render, screen } from '@testing-library/react-native';

import { CardBody } from './card-body.component';

describe('CardBody', () => {
  it('should render children', () => {
    render(
      <CardBody>
        <Text>Body</Text>
      </CardBody>,
    );

    expect(screen.getByText('Body')).toBeTruthy();
  });
});
