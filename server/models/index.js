import User from './User.js';
import Category from './Category.js';
import Origin from './Origin.js';
import MealType from './MealType.js';
import Recipe from './Recipe.js';
import RecipeIngredient from './RecipeIngredient.js';
import RecipeStep from "./RecipeStep.js";
import Comment from './Comment.js';

const models = {
    User,
    Category,
    Origin,
    MealType,
    Recipe,
    RecipeIngredient,
    RecipeStep,
    Comment,
};

Object.values(models).forEach(function (model) {
    // appelle associate que si la méthode existe vraiment
    if (typeof model.associate === 'function') {
        model.associate(models);
    }
});

export default models;