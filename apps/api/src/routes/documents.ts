import { Router, type Request, type Response } from 'express'
import { z } from 'zod'

import { deleteDocumentByUserId, findDocumentByUserId, upsertDocumentByUserId } from '@llm-gateway/db'

export const documentsRouter = Router()

const UpsertBody = z.object({
  title: z.string().min(1).max(255),
  content: z.string().min(1).max(8000),
})

documentsRouter.post('/', async (req: Request, res: Response) => {
  const userId = req.userId as string

  const parsed = UpsertBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }

  await upsertDocumentByUserId(userId, parsed.data.title, parsed.data.content)
  res.status(200).json({ ok: true })
})

documentsRouter.delete('/', async (req: Request, res: Response) => {
  const userId = req.userId as string
  await deleteDocumentByUserId(userId)
  res.status(200).json({ ok: true })
})

documentsRouter.get('/me', async (req: Request, res: Response) => {
  const userId = req.userId as string

  const doc = await findDocumentByUserId(userId)
  res.status(200).json({ document: doc })
})
