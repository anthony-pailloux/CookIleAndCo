// Appels login, session et comptes admin. Le fetch est dans api.js.
import { getFromApi, postToApi, putToApi, deleteToApi } from './api.js';

export async function getCurrentAdmin() {
    return await getFromApi('/api/auth/current-admin');
}

export async function login(email, password) {
    return await postToApi('/api/auth/login', { email, password });
}

export async function logout() {
    return await postToApi('/api/auth/logout');
}

export async function createAdmin(email, password) {
    return await postToApi('/api/auth/admins', { email, password });
}

// Liste des admins
export async function listAdmins() {
    return await getFromApi('/api/auth/admins');
}

export async function deleteAdmin(adminId) {
    return await deleteToApi('/api/auth/admins/' + adminId);
}

export async function updateAdmin(adminId, email, password) {
    return await putToApi('/api/auth/admins/' + adminId, { email, password });
}