// Client HTTP centralisé — toutes les requêtes front → back passent par ici.



// URL du back (ex. http://localhost:3000) — lue depuis client .env
const apiBaseUrl = import.meta.env.VITE_API_URL;

// Envoie une requête HTTP : URL, cookies, body sérialisé en JSON (stringify) si présent ; renvoie la Response brute (pas de parse).
async function requestFromApi(method, path, body) {

    const url = apiBaseUrl + path;
    const options = {

        method: method,
        credentials: 'include',
        headers: {},
    };

    if (body !== undefined) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    return response;
}

// GET : appelle requestFromApi, parse la réponse JSON (response.json), gère les erreurs { error }.
export async function getFromApi(path) {

    const response = await requestFromApi('GET', path);
    const data = await response.json();

    if (!response.ok) {
        let message;
        if (data && data.error) {
            message = data.error;
        } else {
            message = 'Erreur serveur';
        }
        throw new Error(message);
    }
    return data;
}


// POST : envoie un body JSON, parse la réponse, gère les erreurs { error }.
export async function postToApi(path, body) {

    const response = await requestFromApi('POST', path, body);
    const data = await response.json();

    if (!response.ok) {
        let message;
        if (data && data.error) {
            message = data.error;
        } else {
            message = 'Erreur serveur';
        }
        throw new Error(message);
    }
    return data;
}

// PUT : modifie une ressource (body JSON), parse la réponse, gère les erreurs { error }.
export async function putToApi(path, body) {

    const response = await requestFromApi('PUT', path, body);
    const data = await response.json();

    if (!response.ok) {
        let message;
        if (data && data.error) {
            message = data.error;
        } else {
            message = 'Erreur serveur';
        }
        throw new Error(message);
    }
    return data;
}

// DELETE : supprime une ressource, parse la réponse, gère les erreurs { error }.
export async function deleteToApi(path) {

    const response = await requestFromApi('DELETE', path);
    const data = await response.json();

    if (!response.ok) {
        let message;
        if (data && data.error) {
            message = data.error;
        } else {
            message = 'Erreur serveur';
        }
        throw new Error(message);
    }
    return data;
}

