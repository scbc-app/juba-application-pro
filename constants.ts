// Use environment variables for security
// The actual URL should be in .env.local file, not hardcoded here
export const PRE_CONFIGURED_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL 
  || ''; // Empty fallback for security

export const GOOGLE_SHEET_ID = import.meta.env.VITE_GOOGLE_SHEET_ID 
  || ''; // Empty fallback for security

// Optional: Add a security token (for Google Apps Script validation)
export const API_SECURITY_TOKEN = import.meta.env.VITE_API_SECURITY_TOKEN 
  || '';

export const CACHE_TTL = 300000; // 5 minutes

// Re-export everything from modules
export * from './constants/definitions';
export * from './constants/headers';
export * from './constants/scripts';