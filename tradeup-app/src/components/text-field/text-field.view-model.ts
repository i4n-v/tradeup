import { useState } from 'react';

function useTextFieldViewModel() {
  const [focused, setFocused] = useState(false);

  return {
    focused,
    onFocusChange: (isFocused: boolean) => setFocused(isFocused),
  };
}

export { useTextFieldViewModel };
