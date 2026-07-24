import "./Header.css";
import logoCookIle from "../assets/logo-cook-ile-co-cuisine-du-monde-horizontal.webp";

function Header() {
  return (
    <header className="site-header bg-green-textured">
      <img src={logoCookIle} alt="Cook'île & Co — logo" className="logo" />
    </header>
  );
}

export default Header;
