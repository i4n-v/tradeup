import React from 'react';
import type { FieldValues } from 'react-hook-form';

import type { ITextFieldProps } from './text-field.model';
import { useTextFieldViewModel } from './text-field.view-model';
import { TextFieldView } from './text-field.view';

function TextField<T extends FieldValues>(props: ITextFieldProps<T>) {
  const logic = useTextFieldViewModel();
  const { focused, onFocusChange } = logic;
  return <TextFieldView {...props} focused={focused} onFocusChange={onFocusChange} />;
}

export { TextField };
export type { ITextFieldProps } from './text-field.model';
