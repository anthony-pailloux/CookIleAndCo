import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";



function App() {
  return (
    <>
      <Layout>
        

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connexion-superadmin" element={<LoginPage />} />
        </Routes>
        
      </Layout>
    </>
  );
}

export default App;
