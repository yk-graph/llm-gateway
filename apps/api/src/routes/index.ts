import { Router } from 'express'

import { apiKeyAuth, sessionAuth } from '../middleware/index.js'
import { chatRouter } from './chat.js'
import { documentsRouter } from './documents.js'
import { keysRouter } from './keys.js'

export const apiRouter = Router()

apiRouter.use('/chat', apiKeyAuth, chatRouter)
apiRouter.use('/documents', sessionAuth, documentsRouter)
apiRouter.use('/keys', sessionAuth, keysRouter)
