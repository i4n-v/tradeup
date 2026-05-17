import type { IHttpClient } from '@lib/http-client/http-client.interface.lib';

import type { ILoginInput, IRegisterInput } from './auth.type';
import type { ILoginPersistenceDTO, IRegisterPersistenceDTO, IUserPersistenceDTO } from './dtos/auth.persistence.dto';
import type { ILoginDomainDTO, IUserDomainDTO } from './dtos/auth.domain.dto';
import { AuthMapper } from './auth.mapper';

export class AuthService {
  private readonly mapper = new AuthMapper();

  constructor(private readonly httpClient: IHttpClient) {}

  async register(input: IRegisterInput): Promise<IUserDomainDTO> {
    const res = await this.httpClient.post<IRegisterPersistenceDTO>('/auth/register', input);
    return this.mapper.userToDomain(res.user);
  }

  async login(input: ILoginInput): Promise<ILoginDomainDTO> {
    const res = await this.httpClient.post<ILoginPersistenceDTO>('/auth/login', input);
    return { token: res.token, user: this.mapper.userToDomain(res.user) };
  }

  async logout(): Promise<void> {
    await this.httpClient.post('/auth/logout', {});
  }

  async getMe(): Promise<IUserDomainDTO> {
    const res = await this.httpClient.get<IUserPersistenceDTO>('/me');
    return this.mapper.userToDomain(res);
  }
}
