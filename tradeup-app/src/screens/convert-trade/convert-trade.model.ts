import { z } from 'zod';
import type { useForm } from 'react-hook-form';

const convertSchema = z.object({
  amount: z.string().refine((v) => {
    const n = Number.parseFloat(String(v).replace(/\.$/, ''));
    return Number.isFinite(n) && n > 0;
  }, 'Valor deve ser maior que zero'),
});

type IConvertFormValues = z.infer<typeof convertSchema>;

type IConvertDirection = 'brl-to-btc' | 'btc-to-brl';

export interface IConvertTradeViewProps {
  form: ReturnType<typeof useForm<IConvertFormValues>>;
  direction: IConvertDirection;
  onDirectionChange: (d: IConvertDirection) => void;
  onSubmit: () => void;
  isPending: boolean;
  btcPriceBrl: string | null;
  estimatedCounter: string;
  counterLabel: string;
  amountLabel: string;
  moneyFormat: 'brl' | 'btc';
  submitLabel: string;
  variant: 'primary' | 'danger';
  onRefresh: () => void;
  isRefreshing: boolean;
}

export { convertSchema };
export type { IConvertFormValues, IConvertDirection };
