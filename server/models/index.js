// Relie les tables entre elles (associate).
import Admin from './Admin.js';
import Category from './Category.js';
import Origin from './Origin.js';
import MealType from './MealType.js';
import Recipe from './Recipe.js';
import RecipeIngredient from './RecipeIngredient.js';
import RecipeStep from "./RecipeStep.js";
import Comment from './Comment.js';

const models = {
    Admin,
    Category,
    Origin,
    MealType,
    Recipe,
    RecipeIngredient,
    RecipeStep,
    Comment,
};

Object.values(models).forEach(function (model) {
    // Appelle associate seulement si la methode existe
    if (typeof model.associate === 'function') {
        model.associate(models);
    }
});

export default models;