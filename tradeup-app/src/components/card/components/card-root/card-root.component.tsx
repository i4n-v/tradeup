import React from 'react';

import type { ICardRootProps } from './card-root.model';
import { useCardRootViewModel } from './card-root.view-model';
import { CardRootView } from './card-root.view';

function CardRoot({ children, shadow, variant, className }: ICardRootProps) {
  const logic = useCardRootViewModel({ shadow, variant, className });
  const { className: rootClassName } = logic;
  return <CardRootView className={rootClassName}>{children}</CardRootView>;
}

export { CardRoot };
