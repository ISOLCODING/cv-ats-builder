import React from 'react';
import { motion } from 'framer-motion';

const variantClass = {
  primary: 'bg-slate-900 text-white shadow-2xl shadow-slate-900/20 hover:bg-slate-800 border-none',
  secondary: 'bg-white text-slate-900 border-2 border-slate-100 hover:border-blue-500 hover:text-blue-600 shadow-sm hover:shadow-blue-500/10',
  outline: 'bg-transparent text-slate-900 border-2 border-slate-200 hover:border-slate-900 hover:bg-slate-50',
  ghost: 'bg-transparent text-slate-400 hover:text-slate-900 hover:bg-slate-100',
  danger: 'bg-rose-50 text-rose-600 border-2 border-rose-50 hover:border-rose-200 hover:bg-rose-100',
  gold: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:brightness-110'
};

const sizeClass = {
  sm: 'px-5 py-3 text-[9px] font-black uppercase tracking-[0.2em] rounded-xl',
  md: 'px-8 py-4 text-[10px] font-black uppercase tracking-[0.25em] rounded-[1.25rem]',
  lg: 'px-12 py-5 text-xs font-black uppercase tracking-[0.3em] rounded-2xl',
  icon: 'p-4 w-14 h-14 rounded-2xl flex items-center justify-center',
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
  as: Component = 'button', // Support custom element (e.g. 'div')
  ...props
}) {
  const isButton = Component === 'button';
  const MotionComponent = motion[Component] || motion.button;

  return (
    <MotionComponent
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.96 }}
      type={isButton ? type : undefined}
      onClick={disabled || loading ? undefined : onClick}
      disabled={isButton ? (disabled || loading) : undefined}
      className={`
        relative inline-flex items-center justify-center gap-3
        transition-all duration-300 select-none
        outline-none focus:ring-4 focus:ring-blue-500/10 font-display
        ${variantClass[variant] || variantClass.primary} 
        ${sizeClass[size] || ''} 
        ${disabled || loading ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {children && <span>Processing</span>}
        </div>
      ) : (
        <>
            {leftIcon && <span className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{leftIcon}</span>}
            {children && <span className="relative z-10">{children}</span>}
            {rightIcon && <span className="flex-shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">{rightIcon}</span>}
        </>
      )}
    </MotionComponent>
  );
}
