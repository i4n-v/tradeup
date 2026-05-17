import React from 'react';

import type { IButtonIconProps } from './button-icon.model';
import { useButtonIconViewModel } from './button-icon.view-model';
import { ButtonIconView } from './button-icon.view';

function ButtonIcon(props: IButtonIconProps) {
  const logic = useButtonIconViewModel(props);
  return <ButtonIconView {...logic} />;
}

export { ButtonIcon };
export type { IButtonIconProps } from './button-icon.model';
