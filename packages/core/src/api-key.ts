import { createHash, randomBytes } from 'node:crypto'

const TOKEN_PREFIX = 'llmg_'
const DEFAULT_EXPIRY_DAYS = 30

export function generateApiKey(): { token: string; tokenHash: string } {
  const token = TOKEN_PREFIX + randomBytes(32).toString('base64url')
  const tokenHash = hashApiKey(token)
  return { token, tokenHash }
}

export function hashApiKey(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function getApiKeyExpiry(days: number = DEFAULT_EXPIRY_DAYS): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000)
}
