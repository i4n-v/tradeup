import { TradeMapper } from '../trade/trade.mapper';
import type { IHistoryDomainDTO } from './dtos/history.domain.dto';
import type { IHistoryPersistenceDTO } from './dtos/history.persistence.dto';

export class HistoryMapper {
  private tradeMapper = new TradeMapper();

  toDomain(persistence: IHistoryPersistenceDTO): IHistoryDomainDTO {
    return {
      data: persistence.data.map((t) => this.tradeMapper.transactionToDomain(t)),
    };
  }
}
