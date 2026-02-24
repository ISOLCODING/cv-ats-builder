// src/components/ui/Button.jsx
import React from 'react';

const variantClass = {
  primary:   'btn btn-primary',
  secondary: 'btn btn-secondary',
  outline:   'btn btn-outline',
  ghost:     'btn btn-ghost',
  danger:    'btn btn-danger',
};

const sizeClass = {
  sm:   'btn-sm',
  md:   '',
  lg:   'btn-lg',
  icon: 'btn-icon',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${variantClass[variant] || variantClass.primary} ${sizeClass[size] || ''} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" />
          {children && <span>{children}</span>}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
