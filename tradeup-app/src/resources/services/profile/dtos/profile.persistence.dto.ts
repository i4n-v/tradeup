export interface IProfilePersistenceDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}

export interface IAvatarUploadResponseDTO {
  avatarUrl: string;
}
