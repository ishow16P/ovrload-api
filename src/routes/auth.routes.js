import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as ctrl from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: 'Too many attempts, try again in a few minutes' },
});

router.post('/register', limiter, ctrl.register);
router.post('/login', limiter, ctrl.login);
router.post('/logout', ctrl.logout);
router.get('/me', requireAuth, ctrl.me);
router.patch('/me', requireAuth, ctrl.updateMe);
router.put('/password', limiter, requireAuth, ctrl.changePassword);

export default router;
