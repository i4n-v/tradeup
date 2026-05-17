import React from 'react';

import type { IBadgeProps } from './badge.model';
import { useBadgeViewModel } from './badge.view-model';
import { BadgeView } from './badge.view';

function Badge(props: IBadgeProps) {
  const logic = useBadgeViewModel(props);
  return <BadgeView {...logic} />;
}

export { Badge };
export type { IBadgeProps, IBadgeType } from './badge.model';
