import { z } from 'zod';
import type { useForm } from 'react-hook-form';

const sellSchema = z.object({
  amountBtc: z.string().refine((v) => {
    const n = Number.parseFloat(v.replace(/\.$/, ''));
    return Number.isFinite(n) && n > 0;
  }, 'Valor deve ser maior que zero'),
});

type ISellFormValues = z.infer<typeof sellSchema>;

export interface ISellTradeViewProps {
  form: ReturnType<typeof useForm<ISellFormValues>>;
  onSubmit: () => void;
  isPending: boolean;
  btcPriceBrl: string | null;
  estimatedBrl: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export { sellSchema };
export type { ISellFormValues };
