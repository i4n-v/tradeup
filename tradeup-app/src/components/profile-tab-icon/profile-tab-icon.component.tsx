import React from 'react';

import { useProfileTabIconViewModel } from './profile-tab-icon.view-model';
import { ProfileTabIconView } from './profile-tab-icon.view';
import type { IProfileTabIconProps } from './profile-tab-icon.model';

function ProfileTabIcon(props: IProfileTabIconProps) {
  const logic = useProfileTabIconViewModel(props);
  return <ProfileTabIconView {...logic} />;
}

export { ProfileTabIcon };
export type { IProfileTabIconProps } from './profile-tab-icon.model';
