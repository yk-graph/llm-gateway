import { and, eq, gt } from 'drizzle-orm'

import { db } from '../client.js'
import { apiKeys } from '../schema/index.js'

export type ApiKeyRecord = {
  id: string
  userId: string
}

export async function findValidApiKeyByHash(tokenHash: string): Promise<ApiKeyRecord | null> {
  const rows = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.tokenHash, tokenHash), eq(apiKeys.revoked, false), gt(apiKeys.expiresAt, new Date())))
    .limit(1)

  return rows[0] ?? null
}
