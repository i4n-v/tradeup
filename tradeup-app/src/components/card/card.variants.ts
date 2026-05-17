import { cva } from 'class-variance-authority';

const cardRootVariants = cva('bg-base-0 rounded-2xl p-4', {
  variants: {
    shadow: {
      true: 'shadow-sm',
      false: '',
    },
    variant: {
      default: 'bg-base-0',
      primary: 'bg-primary-400',
      elevated: 'bg-base-0 shadow',
    },
  },
  defaultVariants: {
    shadow: false,
    variant: 'default',
  },
});

const cardHeaderVariants = cva('mb-3');

const cardBodyVariants = cva('');

export { cardRootVariants, cardHeaderVariants, cardBodyVariants };
