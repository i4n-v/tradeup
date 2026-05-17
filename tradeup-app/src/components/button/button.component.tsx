import { ButtonRoot } from './components/button-root/button-root.component';
import { ButtonText } from './components/button-text/button-text.component';
import { ButtonIcon } from './components/button-icon/button-icon.component';

const Button = { Root: ButtonRoot, Text: ButtonText, Icon: ButtonIcon };

export { Button };
export type { IButtonRootProps } from './components/button-root/button-root.model';
export type { IButtonTextProps } from './components/button-text/button-text.model';
export type { IButtonIconProps } from './components/button-icon/button-icon.model';
