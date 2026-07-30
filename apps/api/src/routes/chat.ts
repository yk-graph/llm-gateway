import { Router, type Request, type Response } from 'express'
import { z } from 'zod'

import { loadAllDocs } from '../lib/docs.js'
import { loadPrompt, listPrompts } from '../lib/prompts.js'
import { askOllama } from '../lib/ollama.js'

export const chatRouter = Router()

// Input validation schema
const ChatBody = z.object({
  question: z.string().min(1, 'question is required'),
  prompt: z.string().optional(),
})

chatRouter.get('/prompts', async (_req: Request, res: Response) => {
  res.json({ prompts: await listPrompts() })
})

chatRouter.post('/chat', async (req: Request, res: Response) => {
  const parsed = ChatBody.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues })
    return
  }
  const { question, prompt } = parsed.data

  try {
    // 1) load documents  2) select prompt
    const [docs, systemPrompt] = await Promise.all([loadAllDocs(), loadPrompt(prompt)])

    // 3) assemble (prompt = system, docs + question = user)
    const userContent =
      `Answer the question based on the following documents.\n\n` +
      `==== Documents ====\n${docs}\n\n` +
      `==== Question ====\n${question}`

    // 4) send to Ollama  5) return
    const { answer } = await askOllama(systemPrompt, userContent)
    res.json({ answer })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'unknown error'
    res.status(500).json({ error: message })
  }
})
