import React from 'react';

/**
 * Reusable Card component with clean black border and offset shadow
 */
export default function Card({
  title,
  subtitle,
  icon,
  action,
  children,
  className = '',
  ...rest
}) {
  return (
    <div className={`card ${className}`.trim()} {...rest}>
      {(title || icon || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h3 className="card-title" style={{ margin: 0 }}>
            {icon && <span style={{ fontSize: '1.2rem' }}>{icon}</span>}
            {title}
          </h3>
          {action && <div>{action}</div>}
        </div>
      )}
      {subtitle && <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-3)' }}>{subtitle}</p>}
      {children}
    </div>
  );
}
