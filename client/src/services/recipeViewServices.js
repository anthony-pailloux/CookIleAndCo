// Enregistre une page publique, et lit les stats pour le dashboard admin.
import { getFromApi, postToApi } from './api.js';

export async function recordPageView(pageType, recipeId) {
    const body = {
        pageType: pageType,
    };

    if (pageType === 'recipe') {
        body.recipeId = recipeId;
    }

    return await postToApi('/api/recipe-views', body);
}

export async function getRecipeViewStats(period) {
    return await getFromApi('/api/admin/stats/recipe-views?period=' + period);
}
