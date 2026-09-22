import React from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

export default function Home() {
  return (
    <PageContainer>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: 'var(--space-8) 0' }}>
        {/* Project Eyebrow Badge */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <span className="badge badge-yellow">DAA Mini-Project</span>
        </div>

        {/* Hero Section */}
        <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.03em', marginBottom: 'var(--space-2)' }}>
          PUZZLE SOLVER
        </h1>
        <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.75rem)', fontWeight: '700', color: 'var(--color-text)', marginBottom: 'var(--space-4)' }}>
          Intelligent Puzzle Solver Using BFS / DFS
        </h2>
        
        <p style={{ fontSize: '1.15rem', maxWidth: '600px', margin: '0 auto var(--space-8)', color: 'var(--color-text-muted)' }}>
          Explore puzzle states and solve sliding puzzles using Breadth-First Search and Depth-First Search algorithm visualizations.
        </p>

        {/* Hero Action Buttons */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
          <Link to="/puzzle">
            <Button variant="primary" size="lg">
              🚀 START SOLVING
            </Button>
          </Link>
          <Link to="/how-it-works">
            <Button variant="outline" size="lg">
              📖 HOW IT WORKS
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
          gap: 'var(--space-4)', 
          textAlign: 'left' 
        }}>
          <Card
            title="Numerical Puzzle"
            icon="🔢"
            subtitle="Classic 8-Puzzle (3×3) and 15-Puzzle (4×4) sliding tile challenges with goal state validation."
          />

          <Card
            title="Image Puzzle"
            icon="🖼"
            subtitle="Upload any image to slice into interactive tiles and reconstruct the visual state."
          />

          <Card
            title="BFS / DFS"
            icon="🧠"
            subtitle="Step-by-step state space exploration with Queue & Stack visualization and complexity comparison."
          />
        </div>
      </div>
    </PageContainer>
  );
}
