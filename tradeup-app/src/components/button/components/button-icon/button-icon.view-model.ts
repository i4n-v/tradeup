import type { IButtonIconProps, IButtonIconViewProps } from './button-icon.model';

function useButtonIconViewModel({ children }: IButtonIconProps): IButtonIconViewProps {
  return { children };
}

export { useButtonIconViewModel };
