import { z } from 'zod';
import type { useForm } from 'react-hook-form';

const profileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
});

type IProfileFormValues = z.infer<typeof profileSchema>;

export interface IProfileViewProps {
  form: ReturnType<typeof useForm<IProfileFormValues>>;
  onSave: () => void;
  onChangeAvatar: () => void;
  onLogout: () => void;
  isSaving: boolean;
  isUploadingAvatar: boolean;
  email: string;
  avatarUrl: string | null;
  name: string;
  isLoading: boolean;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export { profileSchema };
export type { IProfileFormValues };
