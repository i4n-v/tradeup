import type { PT_BR } from '@/i18n/pt-BR';

type IBadgeType = 'BUY' | 'SELL' | 'COMPLETED' | 'PENDING' | 'FAILED';

interface IBadgeProps {
  type: IBadgeType;
  className?: string;
}

interface IBadgeViewProps {
  label: string;
  containerClass: string;
  dotClass: string;
  textClass: string;
}

export type { IBadgeType, IBadgeProps, IBadgeViewProps };
