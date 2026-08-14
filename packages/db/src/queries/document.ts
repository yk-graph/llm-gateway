import { eq } from 'drizzle-orm'

import { db } from '../client.js'
import { documents } from '../schema/index.js'

export type DocumentRecord = {
  id: string
  title: string
  content: string
}

export async function findDocumentByUserId(userId: string): Promise<DocumentRecord | null> {
  const rows = await db
    .select({
      id: documents.id,
      title: documents.title,
      content: documents.content,
    })
    .from(documents)
    .where(eq(documents.userId, userId))
    .limit(1)

  return rows[0] ?? null
}
