import React from 'react';
import { render, screen } from '@testing-library/react-native';

import { Badge } from './badge.component';

describe('Badge', () => {
  it('should render label for BUY type', () => {
    render(<Badge type="BUY" />);

    expect(screen.getByLabelText('Compra')).toBeTruthy();
  });
});
