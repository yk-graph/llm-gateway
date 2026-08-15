import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'

import { auth } from '../auth.js'

export async function sessionAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })

  if (!session) {
    res.status(401).json({ error: 'unauthorized' })
    return
  }

  req.userId = session.user.id
  next()
}
