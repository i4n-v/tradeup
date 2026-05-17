import type { IHttpClient } from '@lib/http-client/http-client.interface.lib';

import type { IBuyInput, ISellInput } from './trade.type';
import type { ITradePersistenceDTO } from './dtos/trade.persistence.dto';
import type { ITradeDomainDTO } from './dtos/trade.domain.dto';
import { TradeMapper } from './trade.mapper';

export class TradeService {
  private readonly mapper = new TradeMapper();

  constructor(private readonly httpClient: IHttpClient) {}

  async buy(input: IBuyInput): Promise<ITradeDomainDTO> {
    const res = await this.httpClient.post<ITradePersistenceDTO>('/trades/buy', input);
    return this.mapper.toDomain(res);
  }

  async sell(input: ISellInput): Promise<ITradeDomainDTO> {
    const res = await this.httpClient.post<ITradePersistenceDTO>('/trades/sell', input);
    return this.mapper.toDomain(res);
  }
}
