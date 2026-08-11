import { Router, type Request, type Response } from 'express'
import { z } from 'zod'

import { findDocumentByUserId } from '@llm-gateway/db'
import { askOllama } from '../lib/ollama.js'

export const chatRouter = Router()

const SYSTEM_PROMPT =
  'You are a helpful assistant. Answer the question based only on the provided document. If the answer is not in the document, say you do not know.'

const ChatBody = z.object({
  question: z.string().min(1, 'question is required'),
})

chatRouter.post('/', async (req: Request, res: Response) => {
  const parsed = ChatBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }

  const userId = req.userId
  if (!userId) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  const doc = await findDocumentByUserId(userId)
  if (!doc) {
    res.status(404).json({ error: 'no document registered' })
    return
  }

  try {
    const userContent =
      `Answer the question based on the following document.\n\n` +
      `==== Document ====\n${doc.content}\n\n` +
      `==== Question ====\n${parsed.data.question}`
    const { answer } = await askOllama(SYSTEM_PROMPT, userContent)

    res.json({ answer })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    res.status(500).json({ error: message })
  }
})
