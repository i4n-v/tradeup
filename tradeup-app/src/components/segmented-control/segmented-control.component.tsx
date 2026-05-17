import React from 'react';

import type { ISegmentedControlProps } from './segmented-control.model';
import { useSegmentedControlViewModel } from './segmented-control.view-model';
import { SegmentedControlView } from './segmented-control.view';

function SegmentedControl(props: ISegmentedControlProps) {
  const logic = useSegmentedControlViewModel(props);
  return <SegmentedControlView {...logic} />;
}

export { SegmentedControl };
export type { ISegmentedControlItem, ISegmentedControlProps } from './segmented-control.model';
