import { Router } from 'express'

import { chatRouter } from './chat.js'
import { keysRouter } from './keys.js'

export const apiRouter = Router()

apiRouter.use('/chat', chatRouter)
apiRouter.use('/keys', keysRouter)
