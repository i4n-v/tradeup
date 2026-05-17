import type { ReactNode } from 'react';
import type { VariantProps } from 'class-variance-authority';

import { cardRootVariants } from '../../card.variants';

interface ICardRootProps extends VariantProps<typeof cardRootVariants> {
  children: ReactNode;
  className?: string;
}

interface ICardRootViewProps {
  children: ReactNode;
  className: string;
}

export type { ICardRootProps, ICardRootViewProps };
