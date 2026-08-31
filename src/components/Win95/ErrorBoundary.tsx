'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ExNihilo 95 Unhandled Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRestart = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = (): void => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  handleCopyDetails = (): void => {
    const details = `ExNihilo 95 Crash Report:
Time: ${new Date().toISOString()}
Error: ${this.state.error?.name || 'Error'}: ${this.state.error?.message || 'Unknown error'}
Stack:
${this.state.error?.stack || 'No stack trace available'}
Component Stack:
${this.state.errorInfo?.componentStack || 'No component stack'}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(details).then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2500);
      });
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: '#0000AA',
            color: '#FFFFFF',
            fontFamily: "'Courier New', Courier, monospace",
            padding: '40px',
            boxSizing: 'border-box',
            zIndex: 999999,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            userSelect: 'text',
          }}
        >
          <div style={{ maxWidth: '780px', width: '100%' }}>
            <div
              style={{
                backgroundColor: '#AAAAAA',
                color: '#0000AA',
                display: 'inline-block',
                padding: '2px 14px',
                fontWeight: 'bold',
                fontSize: '18px',
                marginBottom: '20px',
              }}
            >
              ExNihilo 95
            </div>

            <p style={{ fontSize: '15px', lineHeight: '1.6', marginBottom: '16px' }}>
              An unexpected exception has occurred in the application sub-system.
              <br />
              Current process was trapped safely by the ExNihilo Error Recovery Boundary.
            </p>

            <div
              style={{
                backgroundColor: '#000077',
                border: '1px solid #5555FF',
                padding: '14px',
                marginBottom: '20px',
                fontSize: '13px',
                lineHeight: '1.5',
                maxHeight: '220px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              <div style={{ color: '#FFFF55', fontWeight: 'bold', marginBottom: '6px' }}>
                {this.state.error?.name || 'Error'}: {this.state.error?.message || 'Unknown application error'}
              </div>
              <div style={{ color: '#AAAAAA', fontSize: '12px' }}>
                {this.state.error?.stack || this.state.errorInfo?.componentStack || 'No stack trace available.'}
              </div>
            </div>

            <p style={{ fontSize: '14px', marginBottom: '24px' }}>
              * Click <strong>Restart IDE</strong> to attempt recovery without losing local catalog state.
              <br />
              * Click <strong>Reload Application</strong> to refresh the complete window.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleRestart}
                style={{
                  backgroundColor: '#C0C0C0',
                  color: '#000000',
                  borderTop: '2px solid #FFFFFF',
                  borderLeft: '2px solid #FFFFFF',
                  borderRight: '2px solid #808080',
                  borderBottom: '2px solid #808080',
                  padding: '8px 18px',
                  fontWeight: 'bold',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Restart IDE
              </button>

              <button
                onClick={this.handleReload}
                style={{
                  backgroundColor: '#C0C0C0',
                  color: '#000000',
                  borderTop: '2px solid #FFFFFF',
                  borderLeft: '2px solid #FFFFFF',
                  borderRight: '2px solid #808080',
                  borderBottom: '2px solid #808080',
                  padding: '8px 18px',
                  fontWeight: 'bold',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Reload Application
              </button>

              <button
                onClick={this.handleCopyDetails}
                style={{
                  backgroundColor: '#C0C0C0',
                  color: '#000000',
                  borderTop: '2px solid #FFFFFF',
                  borderLeft: '2px solid #FFFFFF',
                  borderRight: '2px solid #808080',
                  borderBottom: '2px solid #808080',
                  padding: '8px 18px',
                  fontFamily: 'inherit',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                {this.state.copied ? 'Copied to Clipboard!' : 'Copy Error Details'}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
