import type { ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import type { buttonVariants } from '../../button.variants';

interface IButtonRootProps extends VariantProps<typeof buttonVariants> {
  onPress?: () => void;
  children: ReactNode;
  loading?: boolean;
  className?: string;
  accessibilityLabel: string;
}

interface IButtonRootViewProps {
  onPress?: () => void;
  children: ReactNode;
  loading: boolean;
  isDisabled: boolean;
  indicatorColor: string;
  className: string;
  accessibilityLabel: string;
}

export type { IButtonRootProps, IButtonRootViewProps };
