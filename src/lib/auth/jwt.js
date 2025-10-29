import jwt from 'jsonwebtoken';

// Validate JWT secret exists and is secure
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required for production');
}

if (process.env.NODE_ENV === 'production' && JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long in production');
}

const JWT_EXPIRES_IN = process.env.NODE_ENV === 'production' ? '1h' : '7d'; // Shorter expiry for production

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'placement-system',
    audience: 'placement-users'
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'placement-system',
      audience: 'placement-users'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    throw new Error('Token verification failed');
  }
}

export function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d',
    issuer: 'placement-system',
    audience: 'placement-refresh'
  });
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'placement-system',
      audience: 'placement-refresh'
    });
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
}