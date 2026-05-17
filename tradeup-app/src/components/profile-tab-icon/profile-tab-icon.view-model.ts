import { useQuery } from '@tanstack/react-query';

import { Registry } from '@/lib/registry/registry.lib';

import type { IProfileTabIconProps, IProfileTabIconViewProps } from './profile-tab-icon.model';

function useProfileTabIconViewModel(props: IProfileTabIconProps): IProfileTabIconViewProps {
  const profileService = Registry.getInstance().inject('profileService');
  const profileQueryKeys = Registry.getInstance().inject('profileQueryKeys');

  const { data } = useQuery({
    queryKey: profileQueryKeys.profile(),
    queryFn: () => profileService.getProfile(),
  });

  return {
    ...props,
    avatarUrl: data?.avatarUrl ?? null,
  };
}

export { useProfileTabIconViewModel };
