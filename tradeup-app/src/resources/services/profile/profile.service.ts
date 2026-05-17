import type { IHttpClient } from '@lib/http-client/http-client.interface.lib';

import type { IUpdateProfileInput, IAvatarUploadInput } from './profile.type';
import type { IProfilePersistenceDTO, IAvatarUploadResponseDTO } from './dtos/profile.persistence.dto';
import type { IProfileDomainDTO } from './dtos/profile.domain.dto';
import { ProfileMapper } from './profile.mapper';

export class ProfileService {
  private readonly mapper = new ProfileMapper();
  constructor(
    private readonly httpClient: IHttpClient,
    private readonly storageOrigin: string,
  ) {}

  private normalizeAvatarUrl(url: string | null): string | null {
    if (!url) return null;
    return url.replace(/^https?:\/\/[^/]+/, this.storageOrigin);
  }

  async getProfile(): Promise<IProfileDomainDTO> {
    const res = await this.httpClient.get<IProfilePersistenceDTO>('/me');
    return this.mapper.toDomain({ ...res, avatarUrl: this.normalizeAvatarUrl(res.avatarUrl) });
  }

  async updateName(input: IUpdateProfileInput): Promise<IProfileDomainDTO> {
    const res = await this.httpClient.patch<IProfilePersistenceDTO>('/profile', input);
    return this.mapper.toDomain({ ...res, avatarUrl: this.normalizeAvatarUrl(res.avatarUrl) });
  }

  async uploadAvatar(file: IAvatarUploadInput): Promise<string> {
    const formData = new FormData();
    formData.append('avatar', { uri: file.uri, type: file.type, name: file.name } as any);
    const res = await this.httpClient.post<IAvatarUploadResponseDTO>('/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return this.normalizeAvatarUrl(res.avatarUrl) ?? res.avatarUrl;
  }
}
