import type { ITransactionPersistenceDTO } from '../../trade/dtos/trade.persistence.dto';

export interface IHistoryPersistenceDTO {
  data: ITransactionPersistenceDTO[];
}
