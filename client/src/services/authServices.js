import { getFromApi, postToApi, deleteToApi } from './api.js';

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

export async function getCurrentUser() {
    return await getFromApi('/api/auth/current-user');
}

export async function login(email, password) {
    return await postToApi('/api/auth/login', { email, password });
}

export async function logout() {
    const response = await fetch(apiBaseUrl + '/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erreur serveur');
    }
}

export async function createAdmin(email, password) {
    return await postToApi('/api/auth/admins', { email, password });
}

// Liste des admins (isProtected = admin principal non supprimable)
export async function listAdmins() {
    return await getFromApi('/api/auth/admins');
}

export async function deleteAdmin(adminId) {
    return await deleteToApi('/api/auth/admins/' + adminId);
}