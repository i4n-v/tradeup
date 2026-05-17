import { useMemo } from 'react';

import { cn } from '@/lib/utils/cn/cn.util';
import { buttonTextVariants } from '../../button.variants';

import type { IButtonTextProps, IButtonTextViewProps } from './button-text.model';

function useButtonTextViewModel({
  children,
  variant,
  size,
  className,
}: IButtonTextProps): IButtonTextViewProps {
  return useMemo(
    () => ({
      children,
      className: cn(buttonTextVariants({ variant, size }), className),
    }),
    [children, variant, size, className],
  );
}

export { useButtonTextViewModel };
