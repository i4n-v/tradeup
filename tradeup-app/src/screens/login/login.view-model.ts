import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import { useSessionStore } from '@/stores/session.store';
import type { IUnauthStackParamList } from '@/routes/navigation.types';

import { loginSchema, type ILoginFormValues } from './login.model';

function useLoginViewModel() {
  const navigation = useNavigation<NativeStackNavigationProp<IUnauthStackParamList>>();
  const setSession = useSessionStore((s) => s.setSession);
  const registry = Registry.getInstance();
  const authService = registry.inject('authService');
  const authSession = registry.inject('authSession');

  const form = useForm<ILoginFormValues>({
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: ILoginFormValues) => authService.login(data),
    onSuccess: async ({ token, user }) => {
      await authSession.persistToken(token);
      setSession(token, user);
    },
    onError: () => {
      toast.error('E-mail ou senha incorretos');
    },
  });

  return {
    form,
    onSubmit: form.handleSubmit((data) => mutation.mutate(data)),
    isPending: mutation.isPending,
    onGoToRegister: () => navigation.navigate('Register'),
  };
}

export { useLoginViewModel };
