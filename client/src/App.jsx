import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connexion-superadmin" element={<LoginPage />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<p>Dashboard Admin</p>} />
          </Route>
        </Routes>
      </Layout>
    </>
  );
}

export default App;
