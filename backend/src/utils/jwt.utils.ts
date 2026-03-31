const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');

export interface TokenPayload {
  userId: any; // Use any to avoid mongoose type issues
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  
  try {
    return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): any => {
  return jwt.decode(token);
};

export const generateRefreshToken = (): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(40).toString('hex');
};

export const getTokenFromHeader = (header: string | undefined): string | null => {
  if (!header) {
    return null;
  }

  if (header.startsWith('Bearer ')) {
    return header.substring(7);
  }

  return null;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded: any = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getTokenPayload = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};