// URL du back (ex. http://localhost:3000) — lue depuis client .env
const apiBaseUrl = import.meta.env.VITE_API_URL;


async function request(method, path) {
  // URL complète : base + chemin (ex. http://localhost:3000/api/health)
  const url = apiBaseUrl + path;

  console.log('api.request —', method, url);

  // fetch = requête HTTP ; credentials envoie les cookies
  const response = await fetch(url, {
    method: method,
    credentials: 'include',
  });

  console.log('api.request — status:', response.status);

  return response;
}


