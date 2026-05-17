import type { ReactNode } from 'react';

interface ICardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface ICardHeaderViewProps {
  children: ReactNode;
  className: string;
}

export type { ICardHeaderProps, ICardHeaderViewProps };
