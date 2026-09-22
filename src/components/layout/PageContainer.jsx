import React from 'react';
import Navbar from './Navbar';

export default function PageContainer({ children, className = '' }) {
  return (
    <div className="app-container">
      <Navbar />
      <main className={`page-container ${className}`.trim()}>
        {children}
      </main>
      <footer style={{ 
        textAlign: 'center', 
        padding: 'var(--space-6) var(--space-4)', 
        borderTop: 'var(--border-width) solid var(--color-border)', 
        backgroundColor: 'var(--color-surface)',
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--color-text-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span>PUZZLE SOLVER</span>
          <span>•</span>
          <span>DAA Mini Project (BFS / DFS Search Visualization)</span>
        </div>
      </footer>
    </div>
  );
}
