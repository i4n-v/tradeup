import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type IUnauthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type IAuthTabParamList = {
  Dashboard: undefined;
  Trade: { initialTab?: 'buy' | 'sell' | 'convert' } | undefined;
  History: undefined;
  Profile: undefined;
};

export type IRootStackParamList = {
  Unauth: undefined;
  Auth: undefined;
};

export type ILoginScreenProps = NativeStackScreenProps<IUnauthStackParamList, 'Login'>;
export type IRegisterScreenProps = NativeStackScreenProps<IUnauthStackParamList, 'Register'>;
