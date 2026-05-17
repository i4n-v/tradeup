export type TransactionFailureReasonPersistence =
  | 'INSUFFICIENT_BRL_FUNDS'
  | 'INSUFFICIENT_BTC_FUNDS'
  | 'QUOTE_UNAVAILABLE'
  | 'ZERO_RESULT'
  | 'UNKNOWN';

export interface ITransactionPersistenceDTO {
  id: string;
  type: 'BUY' | 'SELL';
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  btcAmount: string;
  brlAmount: string;
  btcPriceBrl: string;
  createdAt: string;
  failureReason?: TransactionFailureReasonPersistence | null;
}

export interface ITradePersistenceDTO {
  transaction: ITransactionPersistenceDTO;
}
