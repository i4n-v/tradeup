import { useMemo } from 'react';

import { cn } from '@/lib/utils/cn/cn.util';
import { cardHeaderVariants } from '../../card.variants';

import type { ICardHeaderProps } from './card-header.model';

function useCardHeaderViewModel({ className }: Pick<ICardHeaderProps, 'className'>) {
  return useMemo(
    () => ({
      className: cn(cardHeaderVariants(), className),
    }),
    [className],
  );
}

export { useCardHeaderViewModel };
