import 'dotenv/config'
import path from 'node:path'

export const config = {
  port: Number(process.env.PORT ?? 8787),

  ollamaUrl: process.env.OLLAMA_URL ?? 'http://localhost:11434/v1',
  model: process.env.MODEL ?? 'gemma4:12b',

  // Normalize to absolute paths so behavior does not depend on the cwd.
  docsDir: path.resolve(process.env.DOCS_DIR ?? './data/docs'),
  promptsDir: path.resolve(process.env.PROMPTS_DIR ?? './data/prompts'),

  defaultPrompt: process.env.DEFAULT_PROMPT ?? 'qa.txt',
} as const
