import { useMemo } from 'react';

import { cn } from '@/utils/cn/cn.util';
import { cardBodyVariants } from '../../card.variants';

import type { ICardBodyProps } from './card-body.model';

function useCardBodyViewModel({ className }: Pick<ICardBodyProps, 'className'>) {
  return useMemo(
    () => ({
      className: cn(cardBodyVariants(), className),
    }),
    [className],
  );
}

export { useCardBodyViewModel };
