import { clerkClient } from '@clerk/express'
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

declare global {
  namespace Express {
    interface Request {
      userId: string
      user: {
        email: string
      }
    }
  }
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeaders = req.headers['authorization']
    const token = authHeaders?.split(' ')[1]

    if (!token) {
      res.status(401).json({ message: 'No token provided' })
      return
    }

    const publicKey = process.env.CLERK_JWT_PUBLIC_KEY

    if (!publicKey) {
      console.error('Missing CLERK_JWT_PUBLIC_KEY in environment variables')
      res.status(500).json({ message: 'Server configuration error' })
      return
    }
    const formattedKey = publicKey.replace(/\\n/g, '\n')

    const decoded = jwt.verify(token, formattedKey, {
      algorithms: ['RS256'],
      issuer: 'http://localhost:3001',
      complete: true,
    })
    console.log('Decoded token:', decoded)

    const userId = (decoded as any).payload.sub

    if (!userId) {
      console.error('No user ID in token payload')
      res.status(403).json({ message: 'Invalid token payload' })
      return
    }

    const user = await clerkClient.users.getUser(userId)
    const primaryEmail = user.emailAddresses.find(
      (email) => email.id === user.primaryEmailAddressId
    )

    if (!primaryEmail) {
      console.error('No email found for user')
      res.status(400).json({ message: 'User email not found' })
      return
    }

    req.userId = userId
    req.user = {
      email: primaryEmail.emailAddress,
    }

    next()
  } catch (error) {
    console.error('Auth error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({
        message: 'Invalid token',
        details:
          process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
      return
    }
    res.status(500).json({
      message: 'Error processing authentication',
      details: (error as Error).message,
    })
    return
  }
}
