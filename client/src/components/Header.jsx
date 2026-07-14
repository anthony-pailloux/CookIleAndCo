import "./Header.css";
import logoCookIle from "../assets/logo-cook-ile-co-cuisine-du-monde-horizontal.png";

function Header() {
  return (
    <header className="site-header">
      <img src={logoCookIle} alt="Cook'île & Co — logo" className="logo" />
    </header>
  );
}

export default Header;
