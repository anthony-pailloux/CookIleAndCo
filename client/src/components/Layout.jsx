import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import "./Layout.css";

function Layout({ children }) {
  return (
    <div className="app-layout">
      <Header />
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
