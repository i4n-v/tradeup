import { z } from 'zod';
import type { useForm } from 'react-hook-form';

const sellSchema = z.object({
  amountBtc: z
    .string()
    .regex(/^\d+(\.\d{1,8})?$/, 'Valor deve ter no máximo 8 casas decimais')
    .refine((v) => parseFloat(v) > 0, 'Valor deve ser maior que zero'),
});

type ISellFormValues = z.infer<typeof sellSchema>;

export interface ISellTradeViewProps {
  form: ReturnType<typeof useForm<ISellFormValues>>;
  onSubmit: () => void;
  isPending: boolean;
  btcPriceBrl: string | null;
  estimatedBrl: string;
}

export { sellSchema };
export type { ISellFormValues };
