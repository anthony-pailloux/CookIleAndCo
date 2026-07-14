import { useEffect, useState } from "react";
import { getFromApi } from "../services/api";


function HomePage() {
  const [healthMessage, setHealthMessage] = useState(
    "En cours de chargement...",
  );

  useEffect(function () {
    async function loadHealth() {
      const response = await getFromApi("/api/health");
      setHealthMessage(response.status);
    }
    loadHealth();
  }, []);

  return (
    <>
      <section className="hero-madras">
        <div className="hero-content">
          <p className="">Des Antilles aux saveurs du monde</p>

          <p>
            <em>"An Nou Ay !"</em>
          </p>
        </div>
      </section>
      <div>
        <p>Connexion au back : {healthMessage}</p>
      </div>
    </>
  );
}

export default HomePage;
