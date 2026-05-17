import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import type { IUnauthStackParamList } from '@/routes/navigation.types';

import { registerSchema, type IRegisterFormValues } from './register.model';

function useRegisterViewModel() {
  const navigation = useNavigation<NativeStackNavigationProp<IUnauthStackParamList>>();
  const authService = Registry.getInstance().inject('authService');

  const form = useForm<IRegisterFormValues>({
    defaultValues: { name: '', email: '', password: '', password_confirmation: '' },
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: IRegisterFormValues) => authService.register(data),
    onSuccess: () => {
      toast.success('Conta criada! Por favor, entre.');
      navigation.navigate('Login');
    },
    onError: () => {
      toast.error('Erro ao criar conta. Tente novamente.');
    },
  });

  return {
    form,
    onSubmit: form.handleSubmit((data) => mutation.mutate(data)),
    isPending: mutation.isPending,
    onGoToLogin: () => navigation.navigate('Login'),
  };
}

export { useRegisterViewModel };
