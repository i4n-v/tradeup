import { z } from 'zod';
import type { useForm } from 'react-hook-form';

const buySchema = z.object({
  amountBrl: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Valor deve ter no máximo 2 casas decimais')
    .refine((v) => parseFloat(v) > 0, 'Valor deve ser maior que zero'),
});

type IBuyFormValues = z.infer<typeof buySchema>;

export interface IBuyTradeViewProps {
  form: ReturnType<typeof useForm<IBuyFormValues>>;
  onSubmit: () => void;
  isPending: boolean;
  btcPriceBrl: string | null;
  estimatedBtc: string;
  onSellPress: () => void;
}

export { buySchema };
export type { IBuyFormValues };
