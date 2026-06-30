// URL du back (ex. http://localhost:3000) — lue depuis client .env
const apiBaseUrl = import.meta.env.VITE_API_URL;


// Envoie une requête HTTP au back : construit l'URL, appelle fetch avec cookies, renvoie la Response brute.
async function fetchFromServer(method, path) {
  
  const url = apiBaseUrl + path;

  console.log('test', method, url);

  const response = await fetch(url, {
    method: method,
    credentials: 'include',
  });

  console.log('test', response.status);

  return response;
}

// Pour lire des données du back (GET) : une seule fonction à appeler depuis les pages.
export async function getFromApi(path) {

    const response = await fetchFromServer('GET', path);

    const data = await response.json();

    console.log('test', data);
    
    return data;
}


