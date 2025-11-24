import { type Page } from '@playwright/test';
import path from 'path';
import { readFileSync, existsSync } from 'fs';

// Type definitions
interface JWTPayload {
  exp: number;
  iat: number;
  [key: string]: unknown;
}

interface AuthCookie {
  name: string;
  value: string;
}

interface AuthState {
  cookies?: AuthCookie[];
}

export interface TokenExpiryInfo {
  isExpired: boolean;
  isExpiringSoon: boolean;
  expiresAt: Date;
  timeRemainingMs: number;
  timeRemainingMinutes: number;
}

/**
 * Decode a JWT token and extract its payload
 * JWTs are in format: header.payload.signature
 * The payload is base64-encoded JSON
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    // Remove "Bearer " prefix if present
    const cleanToken = token.replace(/^Bearer\s+/i, '');

    // Split the JWT into parts
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT format');
      return null;
    }

    // Decode the payload (second part)
    const payload = parts[1];

    // Base64 decode (handle URL-safe base64)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');

    return JSON.parse(jsonPayload) as JWTPayload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Check if a JWT token is expired or will expire soon
 * @param token - The JWT token (with or without "Bearer " prefix)
 * @param bufferMinutes - Minutes before expiry to consider "expiring soon" (default: 5)
 * @returns Object with expiration info
 */
export function checkTokenExpiry(token: string, bufferMinutes: number = 5): TokenExpiryInfo {
  const payload = decodeJWT(token);

  if (!payload || !payload.exp) {
    throw new Error('Invalid JWT token or missing exp claim');
  }

  // JWT exp is in seconds, convert to milliseconds
  const expiresAtMs = payload.exp * 1000;
  const expiresAt = new Date(expiresAtMs);
  const now = Date.now();
  const timeRemainingMs = expiresAtMs - now;
  const timeRemainingMinutes = timeRemainingMs / 1000 / 60;
  const bufferMs = bufferMinutes * 60 * 1000;

  return {
    isExpired: timeRemainingMs <= 0,
    isExpiringSoon: timeRemainingMs > 0 && timeRemainingMs <= bufferMs,
    expiresAt,
    timeRemainingMs,
    timeRemainingMinutes: Math.max(0, timeRemainingMinutes),
  };
}

/**
 * Refresh the JWT token by navigating to the app and extracting new token from cookies
 * @param page - Playwright page object
 * @param fileName - Name of the auth state file (e.g., 'admin_user.json')
 * @returns The new JWT token
 */
export async function refreshJWTToken(page: Page, fileName: string): Promise<string> {
  console.log(`Refreshing JWT token for ${fileName}...`);

  // Navigate to the application to trigger SSO token refresh
  await page.goto('/insights/content/repositories');

  // Wait for navigation to complete
  // eslint-disable-next-line playwright/no-networkidle
  await page.waitForLoadState('networkidle', { timeout: 30000 });

  // Extract the new JWT token from cookies
  const cookies = await page.context().cookies();
  const jwtCookie = cookies.find((cookie) => cookie.name === 'cs_jwt');

  if (!jwtCookie || !jwtCookie.value) {
    throw new Error('Failed to refresh JWT token - cs_jwt cookie not found');
  }

  const newToken = `Bearer ${jwtCookie.value}`;

  // Save the refreshed token to storage state
  await page.context().storageState({
    path: path.join(__dirname, '../../.auth', fileName),
  });

  // Update environment variable
  process.env.TOKEN = newToken;

  const expiry = checkTokenExpiry(newToken);
  console.log(`✓ Token refreshed successfully. New expiry: ${expiry.expiresAt.toISOString()}`);
  console.log(`  Time remaining: ${expiry.timeRemainingMinutes.toFixed(1)} minutes`);

  return newToken;
}

/**
 * Check if token needs refresh and refresh it if necessary
 * Call this before each test or at the start of long-running operations
 * @param page - Playwright page object
 * @param fileName - Auth state filename
 * @param bufferMinutes - Refresh if expiring within this many minutes (default: 5)
 * @returns The current token (refreshed if needed)
 */
export async function ensureValidToken(
  page: Page,
  fileName: string = 'admin_user.json',
  bufferMinutes: number = 5,
): Promise<string> {
  // Get current token from environment or cookies
  let currentToken = process.env.TOKEN;

  if (!currentToken) {
    const cookies = await page.context().cookies();
    const jwtCookie = cookies.find((cookie) => cookie.name === 'cs_jwt');
    currentToken = jwtCookie ? `Bearer ${jwtCookie.value}` : '';
  }

  if (!currentToken) {
    console.warn('No token found, authentication is required');
    return '';
  }

  try {
    const expiry = checkTokenExpiry(currentToken, bufferMinutes);

    console.log(`Token check: ${expiry.timeRemainingMinutes.toFixed(1)} minutes remaining`);

    if (expiry.isExpired) {
      console.warn('⚠️  Token is EXPIRED! Refreshing...');
      return await refreshJWTToken(page, fileName);
    }

    if (expiry.isExpiringSoon) {
      console.log(`⚠️  Token expiring soon (< ${bufferMinutes} min). Refreshing...`);
      return await refreshJWTToken(page, fileName);
    }

    console.log('✓ Token is valid, no refresh needed');
    return currentToken;
  } catch (error) {
    console.error('Error checking token expiry:', error);
    // If we can't check, try to refresh anyway
    return await refreshJWTToken(page, fileName);
  }
}

/**
 * Get token for a specific user from their auth state file
 * @param userName - The user type ('admin_user', 'no_subs_user', 'stable_sam', etc.)
 * @returns Token expiry information
 */
export function getStoredTokenExpiry(userName: string): TokenExpiryInfo | null {
  try {
    const authPath = path.join(__dirname, `../../.auth/${userName}.json`);

    if (!existsSync(authPath)) {
      console.warn(`Auth state file not found: ${authPath}`);
      return null;
    }

    const authStateContent = readFileSync(authPath, 'utf-8');
    const authState: AuthState = JSON.parse(authStateContent);
    const jwtCookie = authState.cookies?.find((c) => c.name === 'cs_jwt');

    if (!jwtCookie) {
      console.warn(`No cs_jwt cookie found in ${userName}.json`);
      return null;
    }

    return checkTokenExpiry(`Bearer ${jwtCookie.value}`);
  } catch (error) {
    console.error(`Error reading token for ${userName}:`, error);
    return null;
  }
}
