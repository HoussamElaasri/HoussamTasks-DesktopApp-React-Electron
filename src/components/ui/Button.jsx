import React from 'react';
import '../../styles/components/button.css';

export function Button({
  variant = 'primary', // primary | secondary | ghost | danger
  size = 'md',        // sm | md | lg
  icon = null,
  children,
  onClick,
  disabled = false,
  className = '',
  title = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
    </button>
  );
}

export default Button;
