import { fromNodeHeaders } from 'better-auth/node'
import { Router, type Request, type Response } from 'express'
import { z } from 'zod'

import { generateApiKey, getApiKeyExpiry } from '@llm-gateway/core'
import { apiKeys, db } from '@llm-gateway/db'

import { auth } from '../auth.js'

export const keysRouter = Router()

const CreateKeyBody = z.object({
  name: z.string().min(1).max(255),
})

keysRouter.post('/create', async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })

  if (!session) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const parsed = CreateKeyBody.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }

  const { token, tokenHash } = generateApiKey()
  await db.insert(apiKeys).values({
    userId: session.user.id,
    name: parsed.data.name,
    tokenHash,
    expiresAt: getApiKeyExpiry(),
  })

  res.status(201).json({ token })
})
