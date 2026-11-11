// Pied de page commun : marque, navigation publique, mentions.
import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer bg-green-textured">
      <div className="site-footer__inner">
        {/* Marque : nom puis accroche, suivis d'un filet jaune. */}
        <div className="site-footer__brand">
          <p className="site-footer__name">Cook'île & Co</p>
          <p className="site-footer__tagline">An Nou Ay !</p>
        </div>

        {/* Pages publiques seulement : pas de lien vers l'administration. */}
        <nav className="site-footer__nav" aria-label="Navigation du pied de page">
          <p className="site-footer__eyebrow">Navigation</p>
          <ul className="site-footer__links">
            <li>
              <Link className="site-footer__link" to="/">
                Accueil
              </Link>
            </li>
            <li>
              <Link className="site-footer__link" to="/recettes">
                Recettes
              </Link>
            </li>
            <li>
              <Link className="site-footer__link" to="/categories">
                Catégorie et origine
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mentions : copyright et crédit du développeur. */}
        <div className="site-footer__bottom">
          <p className="site-footer__copyright">© 2026 Cook'île & Co</p>
          <a
            className="site-footer__credit"
            href="https://anthonydev.fr/"
            target="_blank"
            rel="noopener noreferrer"
          >
            By AnthonyDev
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
