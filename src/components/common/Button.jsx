/**
 * components/common/Button.jsx
 * 재사용 버튼 컴포넌트
 */
import React from 'react';

/**
 * @param {{
 *   variant?: 'primary'|'secondary'|'outline'|'ghost'|'danger',
 *   size?: 'sm'|'md'|'lg',
 *   icon?: boolean,
 *   children?: React.ReactNode,
 *   className?: string,
 * } & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export default function Button({
  variant = 'secondary',
  size = 'md',
  icon = false,
  children,
  className = '',
  ...rest
}) {
  const classes = [
    icon ? 'btn-icon' : 'btn',
    `btn-${variant}`,
    size !== 'md' ? `btn-${size}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
