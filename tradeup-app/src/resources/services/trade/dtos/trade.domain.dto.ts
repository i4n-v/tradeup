export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type TransactionFailureReason =
  | 'INSUFFICIENT_BRL_FUNDS'
  | 'INSUFFICIENT_BTC_FUNDS'
  | 'QUOTE_UNAVAILABLE'
  | 'ZERO_RESULT'
  | 'UNKNOWN';

export interface ITransactionDomainDTO {
  id: string;
  type: 'BUY' | 'SELL';
  status: TransactionStatus;
  btcAmount: string;
  brlAmount: string;
  btcPriceBrl: string;
  createdAt: string;
  failureReason?: TransactionFailureReason | null;
}

export interface ITradeDomainDTO {
  transaction: ITransactionDomainDTO;
}
