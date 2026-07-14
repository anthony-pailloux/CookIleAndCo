import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import Layout from "./components/Layout.jsx";

function App() {
  return (
    <>
      <Layout>
        <nav>
          <Link to="/">Accueil</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
