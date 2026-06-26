import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Button({ children, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button className={`button button--${variant}`} {...props}>
      {children}
    </button>
  );
}
