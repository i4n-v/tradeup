interface IProfileTabIconProps {
  color: string;
  size: number;
}

interface IProfileTabIconViewProps extends IProfileTabIconProps {
  avatarUrl: string | null;
}

export type { IProfileTabIconProps, IProfileTabIconViewProps };
