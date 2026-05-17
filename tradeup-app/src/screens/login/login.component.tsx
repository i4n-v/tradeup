import React from 'react';

import { useLoginViewModel } from './login.view-model';
import { LoginView } from './login.view';

function LoginScreen() {
  const logic = useLoginViewModel();
  return <LoginView {...logic} />;
}

export { LoginScreen };
