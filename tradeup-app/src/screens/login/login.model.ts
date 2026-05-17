import { z } from 'zod';

import type { useLoginViewModel } from './login.view-model';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres'),
});

type ILoginFormValues = z.infer<typeof loginSchema>;

interface ILoginViewProps extends ReturnType<typeof useLoginViewModel> {}

export { loginSchema };
export type { ILoginFormValues, ILoginViewProps };
