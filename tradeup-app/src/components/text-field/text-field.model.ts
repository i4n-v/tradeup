import type { ReactNode } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';

import type { IMask } from '@/utils/money/money.util';

interface ITextFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  /** Content shown inside the field row, before the text input (e.g. icon). */
  leftAdornment?: ReactNode;
  /** Content shown inside the field row, after the text input (e.g. icon or action). */
  rightAdornment?: ReactNode;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  className?: string;
  /** Máscara de formatação: `mask` converte canônico → display; `unmask` converte entrada → canônico. */
  mask?: IMask;
}

interface ITextFieldViewProps<T extends FieldValues> extends ITextFieldProps<T> {
  focused: boolean;
  onFocusChange: (focused: boolean) => void;
}

export type { ITextFieldProps, ITextFieldViewProps };
