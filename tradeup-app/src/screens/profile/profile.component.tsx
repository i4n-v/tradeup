import React from 'react';

import { useProfileViewModel } from './profile.view-model';
import { ProfileView } from './profile.view';

function ProfileScreen() {
  const logic = useProfileViewModel();
  return <ProfileView {...logic} />;
}

export { ProfileScreen };
