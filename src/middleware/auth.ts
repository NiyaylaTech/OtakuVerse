import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('⚠️ JWT_SECRET environment variable is missing in production!');
    }
    return 'otakuverse_default_fallback_jwt_secret_2026';
  }
  return secret;
}

/**
 * Middleware to protect routes requiring authentication
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({
      error: 'Authentication required. Please sign in to access this resource.',
    });
    return;
  }

  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret) as { id: string; username: string; email: string };
    
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email,
    };
    
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'Your session has expired. Please sign in again.',
      });
      return;
    }
    
    res.status(401).json({
      error: 'Invalid authentication token. Please sign in again.',
    });
  }
}
