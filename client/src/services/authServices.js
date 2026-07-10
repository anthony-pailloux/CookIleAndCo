import { getFromApi, postToApi } from "./api.js";

const apiBaseUrl = import.meta.env.VITE_API_URL;

export async function getCurrentUser() {
    console.log('authservice : getcurrentuser');

    const user = await getFromApi('/api/auth/current-user');

    console.log('authService.getCurrentUser — user:', user);
    return user;
    
}

export async function login(email, password) {
    
    const user = await postToApi('/api/auth/login', {
        email: email,
        password: password,
    });
    console.log(user);
    
    return user;
};

export async function logout() {
    console.log('logout authservice');
    const response = await fetch(apiBaseUrl + '/api/auth/logout', {
        method: 'POST',
        credentials: "include",
    });
    if (!response.ok) {
        throw new Error("Erreur serveur");
    }
    console.log('logout ok');
    
}