import React from 'react';

import { useRegisterViewModel } from './register.view-model';
import { RegisterView } from './register.view';

function RegisterScreen() {
  const logic = useRegisterViewModel();
  return <RegisterView {...logic} />;
}

export { RegisterScreen };
