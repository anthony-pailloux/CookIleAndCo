// URLs des plannings nommés et de leurs entrées.
import { Router } from 'express';
import { requireAuth } from '../middlewares/accessControl.js';
import validate from '../middlewares/validate.js';
import { planningRules, planningTitleRules } from '../validators/planningRules.js';
import {
    listPlannings,
    createPlanning,
    updatePlanning,
    deletePlanning,
    listPlanningEntries,
    createPlanningEntry,
    deletePlanningEntry,
} from '../controllers/planningController.js';

const router = Router();

router.get('/', requireAuth, listPlannings);
router.post('/', requireAuth, planningTitleRules, validate, createPlanning);
router.patch('/:id', requireAuth, planningTitleRules, validate, updatePlanning);
router.get('/:id/entries', requireAuth, listPlanningEntries);
router.post('/:id/entries', requireAuth, planningRules, validate, createPlanningEntry);
router.delete('/:id/entries/:entryId', requireAuth, deletePlanningEntry);
router.delete('/:id', requireAuth, deletePlanning);

export default router;
