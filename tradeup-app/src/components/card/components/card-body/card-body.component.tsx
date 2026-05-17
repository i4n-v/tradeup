import React from 'react';

import type { ICardBodyProps } from './card-body.model';
import { useCardBodyViewModel } from './card-body.view-model';
import { CardBodyView } from './card-body.view';

function CardBody({ children, className }: ICardBodyProps) {
  const logic = useCardBodyViewModel({ className });
  const { className: bodyClassName } = logic;
  return <CardBodyView className={bodyClassName}>{children}</CardBodyView>;
}

export { CardBody };
