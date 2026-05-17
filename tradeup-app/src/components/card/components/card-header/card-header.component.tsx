import React from 'react';

import type { ICardHeaderProps } from './card-header.model';
import { useCardHeaderViewModel } from './card-header.view-model';
import { CardHeaderView } from './card-header.view';

function CardHeader({ children, className }: ICardHeaderProps) {
  const logic = useCardHeaderViewModel({ className });
  const { className: headerClassName } = logic;
  return <CardHeaderView className={headerClassName}>{children}</CardHeaderView>;
}

export { CardHeader };
