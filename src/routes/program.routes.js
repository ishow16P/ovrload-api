import { Router } from 'express';
import * as ctrl from '../controllers/program.controller.js';
import { validateObjectId } from '../middleware/validateObjectId.js';

const router = Router();

router.get('/', ctrl.list);
router.post('/', ctrl.create);
router.get('/:id', validateObjectId, ctrl.get);
router.put('/:id', validateObjectId, ctrl.update);
router.delete('/:id', validateObjectId, ctrl.remove);

export default router;
