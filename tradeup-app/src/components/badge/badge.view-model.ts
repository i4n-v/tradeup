import { useMemo } from 'react';

import { cn } from '@/lib/utils/cn/cn.util';
import { PT_BR } from '@/i18n/pt-BR';

import type { IBadgeType, IBadgeProps, IBadgeViewProps } from './badge.model';

const BADGE_CONFIG: Record<IBadgeType, { dotClass: string; textClass: string; label: string }> = {
  BUY: { dotClass: 'bg-info-500', textClass: 'text-info-600', label: PT_BR.history.buy },
  SELL: { dotClass: 'bg-warning-500', textClass: 'text-warning-600', label: PT_BR.history.sell },
  COMPLETED: { dotClass: 'bg-success-500', textClass: 'text-success-600', label: PT_BR.history.completed },
  PENDING: { dotClass: 'bg-primary-400', textClass: 'text-primary-500', label: 'Pendente' },
  FAILED: { dotClass: 'bg-error-500', textClass: 'text-error-600', label: 'Falhou' },
};

function useBadgeViewModel({ type, className }: IBadgeProps): IBadgeViewProps {
  return useMemo(() => {
    const config = BADGE_CONFIG[type];
    return {
      label: config.label,
      containerClass: cn('flex-row items-center gap-1', className),
      dotClass: cn('w-2 h-2 rounded-full', config.dotClass),
      textClass: cn('text-xs font-primary-medium', config.textClass),
    };
  }, [type, className]);
}

export { useBadgeViewModel };
