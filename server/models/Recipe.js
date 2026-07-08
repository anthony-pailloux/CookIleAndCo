// une recette

import { DataTypes, Model } from "sequelize";
import sequelize from '../config/database.js';

class Recipe extends Model {
    static associate(models) {

        // chaque recette a une catégorie, une origine et un type de repas
        Recipe.belongsTo(models.Category, {
            foreignKey: 'categoryId',
            as: 'category',
        });

        Recipe.belongsTo(models.Origin, {
            foreignKey: 'originId',
            as: 'origin',
        });
        Recipe.belongsTo(models.MealType, {
            foreignKey: 'mealTypeId',
            as: 'mealType',
        });

        // ingrédients et étapes de la recette
        Recipe.hasMany(models.RecipeIngredient, {
            foreignKey: 'recipeId',
            as: 'ingredients',
        });
        Recipe.hasMany(models.RecipeStep, {
            foreignKey: 'recipeId',
            as: 'steps',
        });
    }
}

Recipe.init(
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        cookingTime: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        tips: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        originId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        mealTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'Recipe',
        tableName: 'recipes',
        underscored: true,
        timestamps: true,
    }
);

export default Recipe;