import React from 'react';
import { motion } from 'framer-motion';

const variantClass = {
  primary: 'bg-[#0066FF] text-white shadow-xl hover:bg-[#0052CC] border border-transparent shadow-blue-500/20',
  secondary: 'bg-[#E3F2FD] text-[#0066FF] border-2 border-[#E3F2FD] hover:bg-[#E3F2FD]/80 hover:border-[#BBDEFB]',
  outline: 'bg-transparent text-[#0066FF] border-2 border-[#E3F2FD] hover:border-[#0066FF] hover:bg-[#E3F2FD]/10',
  ghost: 'bg-transparent text-[#0066FF]/70 hover:text-[#0066FF] hover:bg-[#E3F2FD]/20',
  danger: 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100',
  gold: 'bg-[#4E8EA2] text-white shadow-lg hover:bg-[#6EA2B3] border border-[#4E8EA2]/50'
};

const sizeClass = {
  sm: 'px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl',
  md: 'px-8 py-5 text-xs font-black uppercase tracking-widest rounded-[1.2rem]',
  lg: 'px-14 py-7 text-base font-black uppercase tracking-widest rounded-full',
  icon: 'p-4 w-12 h-12 rounded-2xl flex items-center justify-center',
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
        outline-none focus:ring-4 focus:ring-blue-500/10
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
