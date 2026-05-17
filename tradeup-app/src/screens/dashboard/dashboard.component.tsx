import React from 'react';

import { useDashboardViewModel } from './dashboard.view-model';
import { DashboardView } from './dashboard.view';

function DashboardScreen() {
  const logic = useDashboardViewModel();
  return <DashboardView {...logic} />;
}

export { DashboardScreen };
