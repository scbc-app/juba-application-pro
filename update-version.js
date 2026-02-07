// update-version.js (ES Module)
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageJson = JSON.parse(readFileSync(join(__dirname, './package.json'), 'utf8'));

// Get current date
const now = new Date();
const releaseDate = now.toISOString().split('T')[0];

// Parse version for build increment
const versionParts = packageJson.version.split('.');
const buildNumber = parseInt(versionParts[2]) || 1;

const versionData = {
  version: packageJson.version,
  build: buildNumber.toString(),
  releaseDate: releaseDate,
  releaseNotes: `Version ${packageJson.version} update. Check GitHub for detailed release notes.`,
  minimumRequiredVersion: packageJson.version, // Same version, no force update
  downloadUrl: {
    android: 'https://github.com/scbc-app/juba-application-pro/releases/latest/download/app-release.apk',
    ios: 'https://apps.apple.com/app/idYOUR_APP_ID',
    electron: 'https://github.com/scbc-app/juba-application-pro/releases/latest'
  },
  forceUpdate: false,
  additionalInfo: {
    buildDate: now.toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: [
      'Live Updates',
      'SolutionsDrawer Component',
      'Mobile & Desktop Platforms',
      'Enhanced PWA Support',
      'Auto Update System'
    ],
    capacitor: {
      appId: 'com.scbc.safetycheck',
      channel: 'production'
    }
  }
};

// Ensure public directory exists
const publicDir = join(__dirname, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Write version file
const versionFilePath = join(publicDir, 'version.json');
writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
console.log('✅ Version file created at:', versionFilePath);
console.log('📋 Version:', versionData.version);