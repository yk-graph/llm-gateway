import express from 'express'
import { config } from './config.js'
import { chatRouter } from './routes/chat.js'

const app = express()

app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, model: config.model })
})

app.use('/api', chatRouter)

app.listen(config.port, () => {
  console.log(`llm-gateway listening on http://localhost:${config.port}`)
  console.log(`  model     : ${config.model}`)
  console.log(`  ollamaUrl : ${config.ollamaUrl}`)
  console.log(`  docsDir   : ${config.docsDir}`)
  console.log(`  promptsDir: ${config.promptsDir}`)
})
