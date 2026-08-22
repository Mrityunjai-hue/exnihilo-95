'use client';

import dynamic from 'next/dynamic';

// Dynamically import Desktop with ssr: false so CodeMirror & sql.js initialize in browser
const Desktop = dynamic(
  () => import('../components/Win95/Desktop').then((mod) => mod.Desktop),
  { ssr: false }
);

export default function Home() {
  return <Desktop />;
}
