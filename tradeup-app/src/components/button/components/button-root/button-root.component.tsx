import React from 'react';

import type { IButtonRootProps } from './button-root.model';
import { useButtonRootViewModel } from './button-root.view-model';
import { ButtonRootView } from './button-root.view';

function ButtonRoot(props: IButtonRootProps) {
  const logic = useButtonRootViewModel(props);
  return <ButtonRootView {...logic} />;
}

export { ButtonRoot };
export type { IButtonRootProps } from './button-root.model';
