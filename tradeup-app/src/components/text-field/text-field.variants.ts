import { cva } from 'class-variance-authority';

const textFieldContainerVariants = cva(
  'flex-row items-center border rounded-xl bg-white',
  {
    variants: {
      focused: { true: 'border-yellow-400', false: 'border-gray-200' },
      error: { true: 'border-red-400', false: '' },
    },
    defaultVariants: { focused: false, error: false },
  },
);

const textFieldInputClassName =
  'flex-1 py-3 font-secondary text-gray-900 text-base bg-transparent placeholder:text-gray-400';

export { textFieldContainerVariants, textFieldInputClassName };
