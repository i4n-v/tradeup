import Toast from 'react-native-toast-message';
import { toast } from './toast.lib';

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

describe('toast', () => {
  beforeEach(() => {
    jest.mocked(Toast.show).mockClear();
  });

  it('should show success toast', () => {
    toast.success('OK');

    expect(Toast.show).toHaveBeenCalledWith({ type: 'success', text1: 'OK' });
  });

  it('should show error toast', () => {
    toast.error('Fail');

    expect(Toast.show).toHaveBeenCalledWith({ type: 'error', text1: 'Fail' });
  });

  it('should show info toast', () => {
    toast.info('Note');

    expect(Toast.show).toHaveBeenCalledWith({ type: 'info', text1: 'Note' });
  });
});
