import { cn } from './cn.util';

describe('cn', () => {
  it('should merge tailwind classes and resolve conflicts with tailwind-merge', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('should handle conditional classes from clsx', () => {
    expect(cn('base', false && 'hidden', true && 'flex')).toBe('base flex');
  });
});
