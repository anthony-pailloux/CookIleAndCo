import { getFromApi, postToApi } from './api.js';

const apiBaseUrl = import.meta.env.VITE_API_URL;

export async function getCurrentUser() {
    const user = await getFromApi('/api/auth/current-user');
    return user;
}

export async function login(email, password) {
    const user = await postToApi('/api/auth/login', {
        email: email,
        password: password,
    });
    return user;
}

// logout renvoie 204 sans body — fetch direct (postToApi attend du JSON)
export async function logout() {
    const response = await fetch(apiBaseUrl + '/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Erreur serveur');
    }
}
