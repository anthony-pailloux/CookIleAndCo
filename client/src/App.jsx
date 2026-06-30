import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage.jsx";
import DemoPage from "./pages/DemoPage.jsx";

function App() {
  return (
    <>
      <nav>
        <Link to="/">Accueil </Link>
        
        <Link to="/demo"> Démo</Link>
      </nav>

      <Routes>
        <Route path="/" element={<HomePage />}></Route>
        <Route path="/demo" element={<DemoPage />}></Route>
      </Routes>
      
    </>
  );
}

export default App;
