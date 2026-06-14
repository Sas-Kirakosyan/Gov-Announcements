import type { ButtonHTMLAttributes } from 'react';
import common from '@/styles/common.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** `solid` for primary actions, `ghost` for low-emphasis ones. */
  variant?: 'solid' | 'ghost';
}

/**
 * Standard action button built on the shared button styling. Defaults `type`
 * to `button` so it never accidentally submits a form, and accepts an extra
 * `className` for one-off layout tweaks (e.g. spacing).
 */
export function Button({
  variant = 'solid',
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const classes = [
    common.button,
    variant === 'ghost' ? common.buttonGhost : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <button type={type} className={classes} {...props} />;
}
