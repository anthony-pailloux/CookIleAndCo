import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import RecipePage from "./pages/RecipesPage.jsx";
import RecipeDetailsPage from "./pages/RecipeDetailsPage.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connexion-superadmin" element={<LoginPage />} />
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminPage />} />
          </Route>
          <Route path="/recettes" element={<RecipePage />} />
          <Route path="/recettes/:id" element={<RecipeDetailsPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
