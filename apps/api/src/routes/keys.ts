import { Router, type Request, type Response } from 'express'
import { z } from 'zod'

import { generateApiKey, getApiKeyExpiry } from '@llm-gateway/core'
import { apiKeys, db } from '@llm-gateway/db'

export const keysRouter = Router()

const CreateKeyBody = z.object({
  name: z.string().min(1).max(255),
})

keysRouter.post('/create', async (req: Request, res: Response) => {
  const userId = req.userId as string

  const parsed = CreateKeyBody.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }

  const { token, tokenHash } = generateApiKey()
  await db.insert(apiKeys).values({
    userId,
    name: parsed.data.name,
    tokenHash,
    expiresAt: getApiKeyExpiry(),
  })

  res.status(201).json({ token })
})
