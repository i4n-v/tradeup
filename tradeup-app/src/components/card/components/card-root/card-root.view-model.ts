import { useMemo } from 'react';

import { cn } from '@/utils/cn/cn.util';
import { cardRootVariants } from '../../card.variants';

import type { ICardRootProps } from './card-root.model';

function useCardRootViewModel({
  shadow,
  variant,
  className,
}: Pick<ICardRootProps, 'shadow' | 'variant' | 'className'>) {
  return useMemo(
    () => ({
      className: cn(cardRootVariants({ shadow, variant }), className),
    }),
    [shadow, variant, className],
  );
}

export { useCardRootViewModel };
