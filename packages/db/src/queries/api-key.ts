import { and, eq, gt } from 'drizzle-orm'

import { db } from '../client.js'
import { apiKeys } from '../schema/index.js'

export type ApiKeyRecord = {
  id: string
  userId: string
}

export type ApiKeySummary = {
  id: string
  name: string
  expiresAt: Date
  createdAt: Date
}

export async function findValidApiKeyByHash(tokenHash: string): Promise<ApiKeyRecord | null> {
  const rows = await db
    .select({
      id: apiKeys.id,
      userId: apiKeys.userId,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.tokenHash, tokenHash), gt(apiKeys.expiresAt, new Date())))
    .limit(1)

  return rows[0] ?? null
}

export async function listApiKeysByUserId(userId: string): Promise<ApiKeySummary[]> {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      expiresAt: apiKeys.expiresAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId))
}

export async function deleteApiKey(userId: string, keyId: string): Promise<void> {
  await db.delete(apiKeys).where(and(eq(apiKeys.userId, userId), eq(apiKeys.id, keyId)))
}
