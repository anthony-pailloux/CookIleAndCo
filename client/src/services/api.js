// Le fetch unique (cookie + erreurs). Les pages passent par services, pas ici.

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

// Prepare le texte d erreur du back pour l afficher cote client.
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

// Envoie la requete au back avec le cookie. Le JSON est lu plus tard.
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

// Lit le JSON. Une reponse vide (logout 204) n est pas une erreur.
async function readApiResponse(response) {
    const text = await response.text();

    let data = null;
    if (text !== '') {
        data = JSON.parse(text);
    }

    if (!response.ok) {
        const message = buildApiErrorMessage(data);
        throw new Error(message);
    }

    return data;
}

export async function getFromApi(path) {
    const response = await requestFromApi('GET', path);
    return await readApiResponse(response);
}

export async function postToApi(path, body) {
    const response = await requestFromApi('POST', path, body);
    return await readApiResponse(response);
}

export async function putToApi(path, body) {
    const response = await requestFromApi('PUT', path, body);
    return await readApiResponse(response);
}

export async function deleteToApi(path) {
    const response = await requestFromApi('DELETE', path);
    return await readApiResponse(response);
}

// POST fichier photo, pas de JSON, le navigateur envoie le fichier.
export async function postFormToApi(path, formData) {
    const url = apiBaseUrl + path;
    const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        body: formData,
    });

    return await readApiResponse(response);
}
