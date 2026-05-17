export interface ITransactionDomainDTO {
  id: string;
  type: 'BUY' | 'SELL';
  btcAmount: string;
  brlAmount: string;
  btcPriceBrl: string;
  createdAt: string;
}

export interface ITradeDomainDTO {
  transaction: ITransactionDomainDTO;
  wallet: {
    brlBalance: string;
    btcBalance: string;
  };
}
