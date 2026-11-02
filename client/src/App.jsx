// Liste des pages du site. Chaque chemin ouvre une page.
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import RecipesPage from "./pages/RecipesPage.jsx";
import RecipeDetailsPage from "./pages/RecipeDetailsPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import AdminRoute from "./components/AdminRoute.jsx";
import AdminRecipeFormPage from "./pages/AdminRecipeFormPage.jsx";
import AdminReferencesPage from "./pages/AdminReferencesPage.jsx";
import PlanningPage from "./pages/PlanningPage.jsx";
import ShoppingListPage from "./pages/ShoppingListPage.jsx";
import AdminStatsPage from "./pages/AdminStatsPage.jsx";

function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/connexion-admins" element={<LoginPage />} />

          {/* /admin : visiteur → accueil, admin → dashboard. */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<Navigate to="/dashboard-admins" replace />} />
          </Route>

          {/* Filtre admin. Les pages du dashboard s affichent ensuite. */}
          <Route path="/dashboard-admins" element={<AdminRoute />}>
            <Route index element={<AdminPage />} />
            <Route path="recettes/nouvelle" element={<AdminRecipeFormPage />} />
            <Route path="recettes/:id/modifier" element={<AdminRecipeFormPage />} />
            <Route path="referentiels" element={<AdminReferencesPage />} />
            <Route path="planning" element={<PlanningPage />} />
            <Route path="liste-courses" element={<ShoppingListPage />} />
            <Route path="liste-courses/:id" element={<ShoppingListPage />} />
            <Route path="statistiques" element={<AdminStatsPage />} />
          </Route>

          <Route path="/recettes" element={<RecipesPage />} />
          <Route path="/recettes/:id" element={<RecipeDetailsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
