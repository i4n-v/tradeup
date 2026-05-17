export interface ITransactionPersistenceDTO {
  id: string;
  type: 'BUY' | 'SELL';
  btcAmount: string;
  brlAmount: string;
  btcPriceBrl: string;
  createdAt: string;
}

export interface ITradePersistenceDTO {
  transaction: ITransactionPersistenceDTO;
  wallet: {
    brlBalance: string;
    btcBalance: string;
  };
}
