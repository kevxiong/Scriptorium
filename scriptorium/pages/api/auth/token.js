import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export function CreateAccessToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
}

export function CreateRefreshToken(userId) {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

export function validateAccessToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw err;
  }
}

export function validateRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_TOKEN_SECRET);
  } catch (err) {
    throw err;
  }
}