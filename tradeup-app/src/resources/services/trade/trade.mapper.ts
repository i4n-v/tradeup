import type { ITradeDomainDTO, ITransactionDomainDTO } from './dtos/trade.domain.dto';
import type { ITradePersistenceDTO, ITransactionPersistenceDTO } from './dtos/trade.persistence.dto';

export class TradeMapper {
  transactionToDomain(p: ITransactionPersistenceDTO): ITransactionDomainDTO {
    return {
      id: p.id,
      type: p.type,
      status: p.status,
      btcAmount: p.btcAmount,
      brlAmount: p.brlAmount,
      btcPriceBrl: p.btcPriceBrl,
      createdAt: p.createdAt,
      failureReason: p.failureReason ?? null,
    };
  }

  toDomain(p: ITradePersistenceDTO): ITradeDomainDTO {
    return {
      transaction: this.transactionToDomain(p.transaction),
    };
  }
}
