import type { ReactNode } from 'react';

interface ICardBodyProps {
  children: ReactNode;
  className?: string;
}

interface ICardBodyViewProps {
  children: ReactNode;
  className: string;
}

export type { ICardBodyProps, ICardBodyViewProps };
