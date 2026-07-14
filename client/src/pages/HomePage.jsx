import { useEffect, useState } from "react";
import { getFromApi } from "../services/api";
import banniereMadras from "../assets/banniere-madras-antilles.webp";

function HomePage() {
  const [healthMessage, setHealthMessage] = useState(
    "En cours de chargement...",
  );

  useEffect(function () {
    async function loadHealth() {
      const data = await getFromApi("/api/health");
      setHealthMessage(data.status);
    }
    loadHealth();
  }, []);

  return (
    <>
      <section className="hero-madras">
        <div className="hero-content">
          <p className="">Tetelle vous fera découvrir des Antilles aux saveurs du monde</p>

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
