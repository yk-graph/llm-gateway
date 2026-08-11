import express from 'express'
import { toNodeHandler } from 'better-auth/node'

import { config } from './config.js'
import { auth } from './auth.js'
import { chatRouter } from './routes/chat.js'

const app = express()

// https://better-auth.com/docs/integrations/express For ExpressJS v5
app.all('/api/auth/*splat', toNodeHandler(auth))

// Control the maximum request body size to prevent
app.use(express.json({ limit: '1mb' }))

app.get('/health', (_req, res) => {
  res.json({ ok: true, model: config.model })
})

app.use('/api', chatRouter)

app.listen(config.port, () => {
  console.log(`llm-gateway listening on http://localhost:${config.port}`)
  console.log(`  model     : ${config.model}`)
  console.log(`  ollamaUrl : ${config.ollamaUrl}`)
})
