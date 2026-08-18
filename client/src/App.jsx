import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import RecipePage from "./pages/RecipesPage.jsx";
import RecipeDetailsPage from "./pages/RecipeDetailsPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminRecipeFormPage from "./pages/AdminRecipeFormPage.jsx";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connexion-admins" element={<LoginPage />} />
          
          <Route path="/dashbord-admins" element={<AdminRoute />}>
            <Route index element={<AdminPage />} />
            <Route path="recettes/nouvelle" element={<AdminRecipeFormPage />} />
            <Route path="recettes/:id/modifier" element={<AdminRecipeFormPage />} />
          </Route>

          <Route path="/recettes" element={<RecipePage />} />
          <Route path="/recettes/:id" element={<RecipeDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
