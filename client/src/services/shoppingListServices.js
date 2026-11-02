// Appels des listes de courses enregistrées.
// createShoppingList transmet le corps tel quel : replace true demande d'écraser la liste du même nom.
import { getFromApi, postToApi, patchToApi, deleteToApi } from './api.js';

export async function listShoppingLists() {
    return await getFromApi('/api/shopping-lists');
}

export async function createShoppingList(body) {
    return await postToApi('/api/shopping-lists', body);
}

export async function getShoppingList(listId) {
    return await getFromApi('/api/shopping-lists/' + listId);
}

export async function updateShoppingList(listId, body) {
    return await patchToApi('/api/shopping-lists/' + listId, body);
}

export async function createShoppingListItem(listId, body) {
    return await postToApi('/api/shopping-lists/' + listId + '/items', body);
}

export async function updateShoppingListItem(listId, itemId, body) {
    return await patchToApi('/api/shopping-lists/' + listId + '/items/' + itemId, body);
}

export async function deleteShoppingListItem(listId, itemId) {
    return await deleteToApi('/api/shopping-lists/' + listId + '/items/' + itemId);
}

export async function deleteShoppingList(listId) {
    return await deleteToApi('/api/shopping-lists/' + listId);
}
