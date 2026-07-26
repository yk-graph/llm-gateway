import { config } from '../config.js'

interface ChatResult {
  answer: string
}

export async function askOllama(systemPrompt: string, userContent: string): Promise<ChatResult> {
  const res = await fetch(`${config.ollamaUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      stream: false,
    }),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Ollama returned an error (${res.status}): ${text}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const answer = data.choices?.[0]?.message?.content ?? ''
  return { answer }
}
