import type { IHttpClient } from '@lib/http-client/http-client.interface.lib';

import type { IHistoryParams } from './history.type';
import type { IHistoryPersistenceDTO } from './dtos/history.persistence.dto';
import type { IHistoryDomainDTO } from './dtos/history.domain.dto';
import { HistoryMapper } from './history.mapper';

export class HistoryService {
  private readonly mapper = new HistoryMapper();

  constructor(private readonly httpClient: IHttpClient) {}

  async getHistory(params: IHistoryParams): Promise<IHistoryDomainDTO> {
    const res = await this.httpClient.get<IHistoryPersistenceDTO>('/transactions', { params });
    return this.mapper.toDomain(res);
  }
}
