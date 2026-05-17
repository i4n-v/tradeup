import type { VariantProps } from 'class-variance-authority';

import type { buttonTextVariants } from '../../button.variants';

interface IButtonTextProps extends VariantProps<typeof buttonTextVariants> {
  children: string;
  className?: string;
}

interface IButtonTextViewProps {
  children: string;
  className: string;
}

export type { IButtonTextProps, IButtonTextViewProps };
