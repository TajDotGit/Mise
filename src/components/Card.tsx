import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-3xl border border-line bg-white p-4 shadow-sm ${className}`} {...props} />;
}
