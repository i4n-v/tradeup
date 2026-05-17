import { cva } from 'class-variance-authority';

const segmentVariants = cva(
  'flex-1 py-2.5 px-1 rounded-full items-center justify-center',
  {
    variants: {
      active: {
        true: 'bg-primary-400',
        false: 'bg-transparent',
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

const labelVariants = cva('font-primary-semibold text-xs text-center', {
  variants: {
    active: {
      true: 'text-gray-900',
      false: 'text-gray-500',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export { segmentVariants, labelVariants };
