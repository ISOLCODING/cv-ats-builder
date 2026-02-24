// src/components/ui/Input.jsx
import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(function Input(
  {
    label, type = 'text', placeholder, error, helper,
    required, disabled, leftAddon, rightAddon, className = '',
    id, ...props
  },
  ref
) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  if (type === 'textarea') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          placeholder={placeholder}
          disabled={disabled}
          rows={4}
          className={`form-input resize-y ${error ? 'form-input-error' : ''}`}
          {...props}
        />
        {error  && <p className="form-error"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}</p>}
        {!error && helper && <p className="form-helper">{helper}</p>}
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label htmlFor={inputId} className="form-label">
            {label}{required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={`form-input ${error ? 'form-input-error' : ''}`}
          {...props}
        />
        {error  && <p className="form-error"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}</p>}
        {!error && helper && <p className="form-helper">{helper}</p>}
      </div>
    );
  }

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}{required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {leftAddon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="text-blue-400 text-sm">{leftAddon}</span>
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          className={`form-input ${leftAddon ? 'pl-9' : ''} ${rightAddon ? 'pr-9' : ''} ${error ? 'form-input-error' : ''}`}
          {...props}
        />
        {rightAddon && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
            <span className="text-blue-400 text-sm">{rightAddon}</span>
          </div>
        )}
      </div>
      {error  && <p className="form-error"><AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}</p>}
      {!error && helper && <p className="form-helper">{helper}</p>}
    </div>
  );
});

export default Input;
