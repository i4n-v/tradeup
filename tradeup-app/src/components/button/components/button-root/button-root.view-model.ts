import { useMemo } from 'react';

import { cn } from '@/lib/utils/cn/cn.util';
import { buttonVariants } from '../../button.variants';

import type { IButtonRootProps, IButtonRootViewProps } from './button-root.model';

function useButtonRootViewModel({
  children,
  variant,
  size,
  disabled,
  loading,
  onPress,
  className,
  accessibilityLabel,
}: IButtonRootProps): IButtonRootViewProps {
  return useMemo(() => {
    const isDisabled = !!(disabled || loading);
    return {
      onPress,
      children,
      loading: loading ?? false,
      isDisabled,
      indicatorColor: variant === 'primary' || !variant ? '#18181b' : '#eab308',
      className: cn(buttonVariants({ variant, size, disabled: isDisabled }), className),
      accessibilityLabel,
    };
  }, [children, variant, size, disabled, loading, onPress, className, accessibilityLabel]);
}

export { useButtonRootViewModel };
