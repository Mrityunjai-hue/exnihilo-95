#!/usr/bin/env node

/**
 * ExNihilo 95 — Command-Line Interface (CLI) Runner
 * 
 * Powered by ExNihilo 95 Relational Synthesis Engine
 * Concept & Architecture by Mrityunjai (https://github.com/Mrityunjai-hue)
 * Licensed under the MIT License
 */

const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const VERSION = '2.1.0';
const WEB_URL = 'https://exnihilo-95.vercel.app';

const BANNER = `
\x1b[36m  ============================================================\x1b[0m
\x1b[1m\x1b[37m   🗄️  ExNihilo 95 — Zero-Config SQL IDE & Synthesis Engine\x1b[0m
\x1b[36m  ============================================================\x1b[0m
\x1b[90m   Version ${VERSION} | Architecture by Mrityunjai (@Mrityunjai-hue)\x1b[0m
\x1b[90m   "Query tables that don't even exist with zero setup."\x1b[0m
`;

function printHelp() {
  console.log(BANNER);
  console.log(`
\x1b[1mUSAGE:\x1b[0m
  $ npx exnihilo-95 [options] [query]

\x1b[1mOPTIONS:\x1b[0m
  -w, --web           Launch ExNihilo 95 in your default browser (default)
  -p, --port <port>   Specify target port if running local server (default: 3000)
  -d, --download      Open the offline PWA installation & starter download depot
  -v, --version       Show version number (${VERSION})
  -h, --help          Show this help message

\x1b[1mEXAMPLES:\x1b[0m
  $ npx exnihilo-95
  $ npx exnihilo-95 --web
  $ npx exnihilo-95 --download
  $ npx exnihilo-95 "SELECT * FROM celestial_objects ORDER BY distance_light_years DESC"

\x1b[1mONLINE PORTAL:\x1b[0m
  ${WEB_URL}
`);
}

function openBrowser(url) {
  const platform = os.platform();
  let cmd = '';

  if (platform === 'win32') {
    cmd = `start "" "${url}"`;
  } else if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }

  exec(cmd, (err) => {
    if (err) {
      console.log(`\x1b[33m⚠️ Could not auto-open browser. Please visit manually:\x1b[0m \x1b[4m${url}\x1b[0m`);
    } else {
      console.log(`\x1b[32m✔ Launched ExNihilo 95 in your default browser.\x1b[0m`);
    }
  });
}

function run() {
  const args = process.argv.slice(2);

  if (args.includes('-h') || args.includes('--help')) {
    printHelp();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log(`exnihilo-95 v${VERSION}`);
    process.exit(0);
  }

  if (args.includes('-d') || args.includes('--download')) {
    console.log(BANNER);
    const downloadUrl = `${WEB_URL}/download`;
    console.log(`\x1b[34m💽 Opening ExNihilo 95 Offline PWA & Software Depot...\x1b[0m`);
    console.log(`\x1b[90mURL: ${downloadUrl}\x1b[0m\n`);
    openBrowser(downloadUrl);
    return;
  }

  const queryArg = args.find((a) => !a.startsWith('-'));

  console.log(BANNER);

  if (queryArg) {
    console.log(`\x1b[32m🔍 Synthesizing Query Ex Nihilo:\x1b[0m`);
    console.log(`\x1b[37m   ${queryArg}\x1b[0m\n`);
    console.log(`\x1b[34m🚀 Opening interactive query session in Web Studio...\x1b[0m`);
    const encodedQuery = encodeURIComponent(queryArg);
    openBrowser(`${WEB_URL}?sql=${encodedQuery}`);
    return;
  }

  // Default: Launch Web Station
  console.log(`\x1b[34m🚀 Launching ExNihilo 95 Desktop Workstation...\x1b[0m`);
  console.log(`\x1b[90mStation URL: ${WEB_URL}\x1b[0m\n`);
  openBrowser(WEB_URL);
}

run();
