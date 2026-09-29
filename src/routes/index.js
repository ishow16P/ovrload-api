import { Router } from 'express';
import * as exercise from '../controllers/exercise.controller.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { validateObjectId } from '../middleware/validateObjectId.js';
import authRoutes from './auth.routes.js';
import logRoutes from './log.routes.js';
import programRoutes from './program.routes.js';

const router = Router();

router.get('/health', (req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);

// Master exercise list: public, read-only
router.get('/exercises', exercise.list);
router.get('/exercises/:id', validateObjectId, exercise.get);

router.use('/programs', requireAuth, programRoutes);
router.use('/logs', requireAuth, logRoutes);

export default router;
