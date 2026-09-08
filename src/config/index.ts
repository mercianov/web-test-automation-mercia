import * as dotenv from 'dotenv';
dotenv.config();

// ─── Environment Config ────────────────────────────────────────────────────────

export interface EnvConfig {
  BASE_URL: string;
  USERNAME: string;
  PASSWORD: string;

  SLACK_BOT_TOKEN: string;
  SLACK_CHANNEL_ID: string;
}

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export function getEnvConfig(): EnvConfig {
  return {
    BASE_URL: requireEnv('BASE_URL', 'https://www.saucedemo.com'),
    USERNAME: requireEnv('USERNAME', 'standard_user'),
    PASSWORD: requireEnv('PASSWORD', 'secret_sauce'),

    SLACK_BOT_TOKEN: optionalEnv('SLACK_BOT_TOKEN'),
    SLACK_CHANNEL_ID: optionalEnv('SLACK_CHANNEL_ID'),
  };
}

// ─── Credential Helper ────────────────────────────────────────────────────────
// Returns the default login credentials configured via .env.

export function getCredentials(): { username: string; password: string } {
  const env = getEnvConfig();
  return { username: env.USERNAME, password: env.PASSWORD };
}
