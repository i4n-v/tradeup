import type { IHttpClient } from '@lib/http-client/http-client.interface.lib';

import type { IDashboardPersistenceDTO } from './dtos/dashboard.persistence.dto';
import type { IDashboardDomainDTO } from './dtos/dashboard.domain.dto';
import { DashboardMapper } from './dashboard.mapper';

export class DashboardService {
  private readonly mapper = new DashboardMapper();

  constructor(private readonly httpClient: IHttpClient) {}

  async getDashboard(): Promise<IDashboardDomainDTO> {
    const res = await this.httpClient.get<IDashboardPersistenceDTO>('/dashboard');
    return this.mapper.toDomain(res);
  }
}
