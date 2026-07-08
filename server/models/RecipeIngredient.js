// ingrédient d'une recette

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class RecipeIngredient extends Model {
    static associate(models) {
        // lié à une recette
        RecipeIngredient.belongsTo(models.Recipe, {
            foreignKey: 'recipeId',
        });
    }
}

RecipeIngredient.init(
    {
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quantity: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'RecipeIngredient',
        tableName: 'recipe_ingredients',
        underscored: true,
        timestamps: false,
    }
);

export default RecipeIngredient;
