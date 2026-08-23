// Toutes les requêtes React vers Express passent ici (fetch, cookie, erreurs).

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

// Prépare le texte d'erreur du back pour l'afficher côté client.
function buildApiErrorMessage(data) {
    let message;

    if (data && data.fields) {
        const parts = [];

        for (const fieldName in data.fields) {
            const fieldError = data.fields[fieldName];

            if (fieldError && fieldError.msg) {
                parts.push(fieldError.msg);
            }
        }

        if (parts.length > 0) {
            message = parts.join(' · ');
        } else if (data.error) {
            message = data.error;
        } else {
            message = 'Erreur serveur';
        }
    } else if (data && data.error) {
        message = data.error;
    } else {
        message = 'Erreur serveur';
    }

    return message;
}

// Envoie la requête au back avec le cookie. Le JSON est lu plus tard.
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

// Lit le JSON. Si ça a planté, on affiche l'erreur du back.
export async function getFromApi(path) {

    const response = await requestFromApi('GET', path);
    const data = await response.json();

    if (!response.ok) {
        const message = buildApiErrorMessage(data);
        throw new Error(message);
    }
    return data;
}

// Pareil pour POST, PUT, DELETE.
export async function postToApi(path, body) {

    const response = await requestFromApi('POST', path, body);
    const data = await response.json();

    if (!response.ok) {
        const message = buildApiErrorMessage(data);
        throw new Error(message);
    }
    return data;
}

export async function putToApi(path, body) {

    const response = await requestFromApi('PUT', path, body);
    const data = await response.json();

    if (!response.ok) {
        const message = buildApiErrorMessage(data);
        throw new Error(message);
    }
    return data;
}

export async function deleteToApi(path) {

    const response = await requestFromApi('DELETE', path);
    const data = await response.json();

    if (!response.ok) {
        const message = buildApiErrorMessage(data);
        throw new Error(message);
    }
    return data;
}
