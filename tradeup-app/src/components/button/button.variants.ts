import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-full',
  {
    variants: {
      variant: {
        primary: 'bg-yellow-400',
        secondary: 'bg-white border border-gray-200',
        ghost: 'bg-transparent',
        danger: 'bg-red-500',
      },
      size: {
        sm: 'py-2 px-4',
        md: 'py-3 px-6',
        lg: 'py-4 px-8',
      },
      disabled: {
        true: 'opacity-50',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md', disabled: false },
  },
);

const buttonTextVariants = cva('font-primary-semibold text-center', {
  variants: {
    variant: {
      primary: 'text-gray-900',
      secondary: 'text-gray-700',
      ghost: 'text-yellow-500',
      danger: 'text-white',
    },
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
});

export { buttonVariants, buttonTextVariants };
