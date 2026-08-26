// Appels recettes, liste, fiche, photo et commentaires.
import { getFromApi, postToApi, putToApi, deleteToApi, postFormToApi } from './api.js';

export async function listRecipes(options) {
    const params = new URLSearchParams();

    if (options !== undefined) {
        if (options.page !== undefined) {
            params.set('page', options.page);
        }
        if (options.limit !== undefined) {
            params.set('limit', options.limit);
        }
        if (options.category !== undefined && options.category !== '') {
            params.set('categorie', options.category);
        }
        if (options.origin !== undefined && options.origin !== '') {
            params.set('origine', options.origin);
        }
        if (options.mealType !== undefined && options.mealType !== '') {
            params.set('repas', options.mealType);
        }
        if (options.search !== undefined && options.search !== '') {
            params.set('q', options.search);
        }
    }

    let path = '/api/recipes';
    const queryString = params.toString();
    if (queryString !== '') {
        path = '/api/recipes?' + queryString;
    }

    return await getFromApi(path);
}

export async function getRecipeById(recipeId) {
    return await getFromApi('/api/recipes/' + recipeId);
}

export async function createRecipe(recipeBody) {
    return await postToApi('/api/recipes', recipeBody);
}

export async function updateRecipe(recipeId, recipeBody) {
    return await putToApi('/api/recipes/' + recipeId, recipeBody);
}

export async function deleteRecipe(recipeId) {
    return await deleteToApi('/api/recipes/' + recipeId);
}

export async function uploadRecipePhoto(recipeId, file) {
    const formData = new FormData();
    formData.append('photo', file);
    return await postFormToApi('/api/recipes/' + recipeId + '/photo', formData);
}

export async function listRecipeComments(recipeId) {
    return await getFromApi('/api/recipes/' + recipeId + '/comments');
}

export async function createRecipeComment(recipeId, commentBody) {
    return await postToApi('/api/recipes/' + recipeId + '/comments', commentBody);
}

export async function deleteRecipeComment(recipeId, commentId) {
    return await deleteToApi('/api/recipes/' + recipeId + '/comments/' + commentId);
}
