/**
 * ErrorBoundary.tsx — Windows 95 Graceful React Error Boundary
 * Catches uncaught runtime exceptions in child components and prevents
 * the main application from crashing.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Win95 ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="win95-window"
          style={{
            padding: '12px',
            maxWidth: '450px',
            margin: '20px auto',
            boxShadow: '4px 4px 16px rgba(0,0,0,0.5)',
          }}
        >
          <div className="win95-titlebar" style={{ background: '#800000' }}>
            <div className="win95-titlebar-text">
              <span>⚠️</span>
              <span>Application Error</span>
            </div>
          </div>
          <div style={{ padding: '16px 8px', fontSize: '11px', lineHeight: '1.4' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
              An unexpected error occurred inside this component:
            </p>
            <div
              style={{
                background: '#000000',
                color: '#ff5555',
                padding: '8px',
                fontFamily: 'var(--w95-mono)',
                fontSize: '10px',
                borderRadius: '0',
                maxHeight: '120px',
                overflow: 'auto',
                marginBottom: '12px',
              }}
            >
              {this.state.error?.message || 'Unknown Runtime Error'}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button className="win95-button" style={{ fontWeight: 'bold' }} onClick={this.handleReset}>
                🔄 Recover & Restart Component
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
