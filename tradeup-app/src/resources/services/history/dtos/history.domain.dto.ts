import type { ITransactionDomainDTO } from '../../trade/dtos/trade.domain.dto';

export interface IHistoryDomainDTO {
  data: ITransactionDomainDTO[];
}
