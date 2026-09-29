import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const AUTH_COOKIE = 'ovr_token';

export async function requireAuth(req, res, next) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return res.status(401).json({ message: 'Login required' });
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
  // Reject tokens issued before the last password change
  const user = await User.findById(payload.sub).select('+tokenVersion').lean();
  if (!user || (payload.ver ?? 0) !== (user.tokenVersion ?? 0)) {
    return res.status(401).json({ message: 'Session expired, please log in again' });
  }
  req.user = { id: payload.sub };
  next();
}
