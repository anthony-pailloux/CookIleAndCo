import "./Header.css";
import logoCocotte from "../assets/logo-cocotte-du-monde-transparent.png";
import banniereMadras from "../assets/banniere-madras-antilles.webp";

function Header() {
  return (
    <header className="site-header">
      <img src={logoCocotte} alt="Cook'île & Co — logo" className="logo" />
      
      <h1>Cook'île & Co</h1>
    </header>
  );
}

export default Header;
