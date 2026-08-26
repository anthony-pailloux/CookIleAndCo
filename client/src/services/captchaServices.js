// Question anti-robot pour le formulaire commentaire.
import { getFromApi } from './api.js';

export async function getCaptcha() {
    return await getFromApi('/api/captcha');
}
