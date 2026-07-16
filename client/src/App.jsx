import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminRoute from "./pages/AdminRoute.jsx";

function App() {
  return (
    <>
      <Layout>
        

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connexion-superadmin" element={<LoginPage />} />
          <Route path="/admin" element={<AdminRoute />}>
          <Route index element={<p>dashboard amin</p>} />
          </Route> 
                     
        </Routes>
        
      </Layout>
    </>
  );
}

export default App;
