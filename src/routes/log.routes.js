import { Router } from 'express';
import * as ctrl from '../controllers/log.controller.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.get('/', ctrl.list);
router.post('/', ctrl.start);
router.get('/:id', validateObjectId, ctrl.get);
router.put('/:id', validateObjectId, ctrl.update);
router.patch('/:id/finish', validateObjectId, ctrl.finish);
router.delete('/:id', validateObjectId, ctrl.remove);

export default router;
