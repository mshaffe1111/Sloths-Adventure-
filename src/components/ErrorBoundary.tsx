import React from 'react';

/** If a screen ever throws, show a way out instead of a blank dark page. Progress is already saved in storage. */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error('screen crashed', error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center font-game"
        style={{ background: '#0b1a13', color: '#fde68a' }}
      >
        <div style={{ fontSize: 44 }}>🦥</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Pokey tripped over a root!</div>
        <div style={{ color: '#a7f3d0', maxWidth: 320 }}>Your progress is safe. Tap below to get back to the jungle.</div>
        <button
          onClick={() => window.location.reload()}
          style={{ background: '#f59e0b', color: '#052e1c', fontWeight: 800, padding: '12px 28px', borderRadius: 16, fontSize: 18 }}
        >
          Back to the title
        </button>
      </div>
    );
  }
}
