import React from 'react';

import { useHistoryViewModel } from './history.view-model';
import { HistoryView } from './history.view';

function HistoryScreen() {
  const logic = useHistoryViewModel();
  return <HistoryView {...logic} />;
}

export { HistoryScreen };
