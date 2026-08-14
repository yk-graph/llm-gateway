import type { Request, Response, NextFunction } from 'express'

import { hashApiKey } from '@llm-gateway/core'
import { findValidApiKeyByHash } from '@llm-gateway/db'

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'missing api key' })
    return
  }

  const token = header.slice('Bearer '.length)
  const record = await findValidApiKeyByHash(hashApiKey(token))

  if (!record) {
    res.status(401).json({ error: 'invalid api key' })
    return
  }

  req.userId = record.userId
  next()
}
