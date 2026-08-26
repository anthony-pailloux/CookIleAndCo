// Appels categories, origines et types de repas.
import { getFromApi, postToApi, putToApi, deleteToApi, postFormToApi } from './api.js';

export async function listCategories() {
    return await getFromApi('/api/categories');
}

export async function listOrigins() {
    return await getFromApi('/api/origins');
}

export async function listMealTypes() {
    return await getFromApi('/api/mealTypes');
}

export async function listReferenceItems(apiPath) {
    return await getFromApi(apiPath);
}

export async function createReferenceItem(apiPath, name) {
    return await postToApi(apiPath, { name: name });
}

export async function updateReferenceItem(apiPath, itemId, name) {
    return await putToApi(apiPath + '/' + itemId, { name: name });
}

export async function deleteReferenceItem(apiPath, itemId) {
    return await deleteToApi(apiPath + '/' + itemId);
}

export async function uploadReferenceImage(apiPath, itemId, file) {
    const formData = new FormData();
    formData.append('photo', file);
    return await postFormToApi(apiPath + '/' + itemId + '/image', formData);
}
