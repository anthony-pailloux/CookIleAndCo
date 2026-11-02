// Appels des plannings nommés et de leurs recettes.
import { getFromApi, postToApi, patchToApi, deleteToApi } from './api.js';

export async function listPlannings() {
    return await getFromApi('/api/plannings');
}

export async function createPlanning(body) {
    return await postToApi('/api/plannings', body);
}

export async function updatePlanning(planningId, body) {
    return await patchToApi('/api/plannings/' + planningId, body);
}

export async function deletePlanning(planningId) {
    return await deleteToApi('/api/plannings/' + planningId);
}

export async function listPlanningEntries(planningId) {
    return await getFromApi('/api/plannings/' + planningId + '/entries');
}

export async function createPlanningEntry(planningId, body) {
    return await postToApi('/api/plannings/' + planningId + '/entries', body);
}

export async function deletePlanningEntry(planningId, entryId) {
    return await deleteToApi('/api/plannings/' + planningId + '/entries/' + entryId);
}
