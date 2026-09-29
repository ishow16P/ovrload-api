import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { httpError } from '../middleware/errorHandler.js';
import { AUTH_COOKIE } from '../middleware/requireAuth.js';

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
// Compared against when the email doesn't exist → same timing as a real check.
const DUMMY_HASH = bcrypt.hashSync('ovrload-dummy-password', 12);

function setSession(res, user) {
  const token = jwt.sign({ sub: user.id, ver: user.tokenVersion ?? 0 }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: MAX_AGE_MS,
  });
}

export async function register(req, res) {
  const { email, password, displayName } = req.body;
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    throw httpError(400, 'Password must be 8–128 characters');
  }
  if (typeof email !== 'string' || await User.exists({ email: email.trim().toLowerCase() })) {
    throw httpError(409, 'Email is already registered');
  }
  const user = await User.create({
    email,
    displayName: typeof displayName === 'string' && displayName.trim() ? displayName : String(email).split('@')[0],
    passwordHash: await bcrypt.hash(password, 12),
  });
  setSession(res, user);
  res.status(201).json(user);
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') throw httpError(400, 'Email and password are required');
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash +tokenVersion');
  const ok = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) throw httpError(401, 'Invalid email or password');
  setSession(res, user);
  res.json(user);
}

export function logout(req, res) {
  res.clearCookie(AUTH_COOKIE, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  res.status(204).end();
}

export async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) throw httpError(401, 'Login required');
  res.json(user);
}

export async function updateMe(req, res) {
  const { displayName } = req.body;
  if (typeof displayName !== 'string' || !displayName.trim()) throw httpError(400, 'Display name is required');
  const user = await User.findById(req.user.id);
  if (!user) throw httpError(401, 'Login required');
  user.displayName = displayName;
  await user.save();
  res.json(user);
}

export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
    throw httpError(400, 'Current and new password are required');
  }
  if (newPassword.length < 8 || newPassword.length > 128) throw httpError(400, 'New password must be 8–128 characters');
  if (newPassword === currentPassword) throw httpError(400, 'New password must be different');
  const user = await User.findById(req.user.id).select('+passwordHash +tokenVersion');
  if (!user) throw httpError(401, 'Login required');
  // 400 (not 401) so the client doesn't treat a typo as an expired session
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) throw httpError(400, 'Current password is incorrect');
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  user.tokenVersion = (user.tokenVersion ?? 0) + 1;
  await user.save();
  setSession(res, user); // keep this device signed in, others are revoked
  res.status(204).end();
}
