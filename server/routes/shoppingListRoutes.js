// URLs des listes de courses enregistrées.
import { Router } from 'express';
import { requireAuth } from '../middlewares/accessControl.js';
import validate from '../middlewares/validate.js';
import {
    shoppingListRules,
    shoppingListTitleRules,
    shoppingListItemRules,
} from '../validators/shoppingListRules.js';
import {
    listShoppingLists,
    createShoppingList,
    getShoppingList,
    updateShoppingList,
    deleteShoppingList,
    createShoppingListItem,
    updateShoppingListItem,
    deleteShoppingListItem,
} from '../controllers/shoppingListController.js';

const router = Router();

router.get('/', requireAuth, listShoppingLists);
router.post('/', requireAuth, shoppingListRules, validate, createShoppingList);
router.post('/:id/items', requireAuth, shoppingListItemRules, validate, createShoppingListItem);
router.patch('/:id/items/:itemId', requireAuth, shoppingListItemRules, validate, updateShoppingListItem);
router.delete('/:id/items/:itemId', requireAuth, deleteShoppingListItem);
router.get('/:id', requireAuth, getShoppingList);
router.patch('/:id', requireAuth, shoppingListTitleRules, validate, updateShoppingList);
router.delete('/:id', requireAuth, deleteShoppingList);

export default router;
