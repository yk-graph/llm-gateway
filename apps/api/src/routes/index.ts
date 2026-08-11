import { Router } from 'express'

import { apiKeyAuth } from '../middleware/api-key-auth.js'
import { chatRouter } from './chat.js'
import { keysRouter } from './keys.js'

export const apiRouter = Router()

apiRouter.use('/chat', apiKeyAuth, chatRouter)
apiRouter.use('/keys', keysRouter)
