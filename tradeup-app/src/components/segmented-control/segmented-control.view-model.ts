import { cn } from '@/utils/cn/cn.util';

import type { ISegmentedControlProps, ISegmentedControlViewProps } from './segmented-control.model';

function useSegmentedControlViewModel({
  items,
  value,
  onChange,
  className,
}: ISegmentedControlProps): ISegmentedControlViewProps {
  return {
    items,
    value,
    onChange,
    containerClass: cn(
      'flex-row bg-gray-100 rounded-full p-1 border border-gray-200',
      className,
    ),
  };
}

export { useSegmentedControlViewModel };
