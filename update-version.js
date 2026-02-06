// update-version.js (ES Module)
import { readFileSync, writeFileSync } from 'fs';

const packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));

const versionData = {
  version: packageJson.version,
  buildDate: new Date().toISOString(),
  buildNumber: Date.now(),
  environment: process.env.NODE_ENV || 'development',
  features: [
    'Live Updates',
    'SolutionsDrawer Component',
    'Mobile & Desktop Platforms',
    'Enhanced PWA Support'
  ],
  capacitor: {
    appId: 'com.scbc.safetycheck',
    channel: 'production'
  }
};

writeFileSync('./public/version.json', JSON.stringify(versionData, null, 2));
console.log('📦 Version file updated:', versionData.version);