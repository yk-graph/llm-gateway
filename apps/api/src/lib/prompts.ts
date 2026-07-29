import fs from 'node:fs/promises'
import path from 'node:path'

import { config } from '../config.js'

export async function loadPrompt(name?: string): Promise<string> {
  const fileName = path.basename(name ?? config.defaultPrompt)
  const fullPath = path.join(config.promptsDir, fileName)
  try {
    return await fs.readFile(fullPath, 'utf8')
  } catch {
    throw new Error(`Cannot read prompt: ${fullPath}`)
  }
}

/** Returns the list of selectable prompts in promptsDir. */
export async function listPrompts(): Promise<string[]> {
  try {
    const entries = await fs.readdir(config.promptsDir)
    return entries.filter((f) => f.endsWith('.txt')).sort()
  } catch {
    return []
  }
}
