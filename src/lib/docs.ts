import fs from 'node:fs/promises'
import path from 'node:path'

import { config } from '../config.js'

export async function loadAllDocs(): Promise<string> {
  let entries: string[]

  try {
    entries = await fs.readdir(config.docsDir)
  } catch {
    throw new Error(`Cannot read documents directory: ${config.docsDir}`)
  }

  const mdFiles = entries.filter((f) => f.endsWith('.md')).sort()
  if (mdFiles.length === 0) {
    throw new Error(`No Markdown documents found in: ${config.docsDir}`)
  }

  const chunks = await Promise.all(
    mdFiles.map(async (file) => {
      const body = await fs.readFile(path.join(config.docsDir, file), 'utf8')
      return `# === ${file} ===\n\n${body}`
    }),
  )

  return chunks.join('\n\n---\n\n')
}
