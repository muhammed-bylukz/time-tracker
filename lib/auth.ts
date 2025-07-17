import jwt from 'jsonwebtoken';
import { IUser } from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function getUserFromToken(token: string): TokenPayload | null {
  if (!token) return null;
  
  const cleanToken = token.replace('Bearer ', '');
  return verifyToken(cleanToken);
}