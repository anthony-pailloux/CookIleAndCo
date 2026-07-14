import { useEffect, useState } from "react";
import { getFromApi } from "../services/api";

function HomePage() {
  const [healthMessage, setHealthMessage] = useState("En cours de chargement...");

  useEffect(function () {
    async function loadHealth() {
      const data = await getFromApi("/api/health");
      setHealthMessage(data.status);
    }
    loadHealth();
  }, []);

  return (
    <main>
      <h2 className="">Des Antilles aux saveurs du monde</h2>
      <p>An Nou Ay !</p>
      <p></p>
      <p>Connexion au back : {healthMessage}</p>
    </main>
  );
}

export default HomePage;
