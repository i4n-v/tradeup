import React from 'react';

import type { IButtonTextProps } from './button-text.model';
import { useButtonTextViewModel } from './button-text.view-model';
import { ButtonTextView } from './button-text.view';

function ButtonText(props: IButtonTextProps) {
  const logic = useButtonTextViewModel(props);
  return <ButtonTextView {...logic} />;
}

export { ButtonText };
export type { IButtonTextProps } from './button-text.model';
