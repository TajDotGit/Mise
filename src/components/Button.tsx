import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<Variant, string> = {
  primary: 'bg-brand text-on-brand hover:bg-brand-dark active:bg-brand-dark',
  secondary: 'bg-surface text-ink border border-line hover:bg-canvas',
  ghost: 'text-brand hover:bg-brand-soft',
  danger: 'bg-surface text-danger border border-danger/30 hover:bg-danger-soft',
};

export function Button({
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
