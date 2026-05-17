import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { launchImageLibrary } from 'react-native-image-picker';

import { Registry } from '@lib/registry/registry.lib';
import { toast } from '@/lib/toast/toast.lib';
import { useSessionStore } from '@/stores/session.store';
import { PT_BR } from '@/i18n/pt-BR';
import type { IAvatarUploadInput } from '@/resources/services/profile/profile.type';
import type { IProfileDomainDTO } from '@/resources/services/profile/dtos/profile.domain.dto';

import { profileSchema, type IProfileFormValues, type IProfileViewProps } from './profile.model';

function useProfileViewModel(): IProfileViewProps {
  const clearSession = useSessionStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  const registry = Registry.getInstance();
  const profileService = registry.inject('profileService');
  const profileQueryKeys = registry.inject('profileQueryKeys');
  const authSession = registry.inject('authSession');

  const form = useForm<IProfileFormValues>({
    defaultValues: { name: '' },
    resolver: zodResolver(profileSchema),
  });

  const {
    data: profile,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: profileQueryKeys.profile(),
    queryFn: () => profileService.getProfile(),
  });

  useEffect(() => {
    if (profile?.name) form.reset({ name: profile.name });
    // form from useForm() is stable across renders (React Hook Form guarantee)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.name]);

  const saveMutation = useMutation({
    mutationFn: (data: IProfileFormValues) => profileService.updateName(data),
    onSuccess: () => {
      toast.success(PT_BR.profile.nameUpdated);
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile() });
    },
    onError: () => toast.error(PT_BR.common.error),
  });

  const avatarMutation = useMutation({
    mutationFn: (input: IAvatarUploadInput) => profileService.uploadAvatar(input),
    onSuccess: (newAvatarUrl) => {
      toast.success(PT_BR.profile.avatarUpdated);
      queryClient.setQueryData(
        profileQueryKeys.profile(),
        (old: IProfileDomainDTO | undefined) => (old ? { ...old, avatarUrl: newAvatarUrl } : old),
      );
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.profile() });
    },
    onError: () => toast.error(PT_BR.common.error),
  });

  const onChangeAvatar = async () => {
    const res = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
      maxWidth: 1024,
      maxHeight: 1024,
    });
    if (res.didCancel || !res.assets?.[0]) return;

    const asset = res.assets[0];
    const uri = asset.uri;
    if (!uri) return;
    const type = asset.type || 'image/jpeg';
    const name = asset.fileName || `avatar-${Date.now()}.jpg`;
    avatarMutation.mutate({ uri, type, name });
  };

  const onLogout = () => {
    Alert.alert(
      PT_BR.auth.logoutConfirmTitle,
      PT_BR.auth.logoutConfirmMessage,
      [
        { text: PT_BR.auth.logoutConfirmCancel, style: 'cancel' },
        {
          text: PT_BR.auth.logoutConfirmOk,
          style: 'destructive',
          onPress: async () => {
            await authSession.clearToken();
            clearSession();
          },
        },
      ],
    );
  };

  return {
    form,
    onSave: form.handleSubmit((data) => saveMutation.mutate(data)),
    onChangeAvatar,
    onLogout,
    isSaving: saveMutation.isPending,
    isUploadingAvatar: avatarMutation.isPending,
    email: profile?.email ?? '',
    avatarUrl: profile?.avatarUrl ?? null,
    name: profile?.name ?? '',
    isLoading,
    onRefresh: () => {
      void refetch();
    },
    isRefreshing: isFetching,
  };
}

export { useProfileViewModel };
