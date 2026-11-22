import { ImageResponse } from 'next/og';

export const alt = 'ExNihilo 95 — Zero-Schema Relational SQL Studio';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#008080',
          fontFamily: 'sans-serif',
          color: '#ffffff',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#c0c0c0',
            border: '4px solid #ffffff',
            boxShadow: '8px 8px 0px rgba(0,0,0,0.5)',
            width: '900px',
            color: '#000000',
            padding: '24px',
          }}
        >
          <div
            style={{
              backgroundColor: '#000080',
              color: '#ffffff',
              padding: '8px 16px',
              fontSize: '28px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            <span>💾</span>
            <span>ExNihilo 95 — Professional SQL Studio</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>
            Run SQL Queries Instantly Without Creating Tables
          </div>
          <div style={{ fontSize: '20px', color: '#444444', lineHeight: 1.5 }}>
            Eliminate &quot;Table not found&quot; errors. Zero-backend, 100% client-side WebAssembly SQLite with real-time relational synthesis, SQL Noir murder mystery, and authentic Windows 95 aesthetics.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
