import React from 'react';

/**
 * Reusable SectionTitle component for headers and subheadings
 */
export default function SectionTitle({
  title,
  subtitle,
  tag,
  align = 'left',
  className = '',
}) {
  const alignStyle = align === 'center' ? { textAlign: 'center' } : {};

  return (
    <div className={`section-title ${className}`.trim()} style={alignStyle}>
      {tag && (
        <span className="badge badge-cyan" style={{ marginBottom: 'var(--space-2)' }}>
          {tag}
        </span>
      )}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
