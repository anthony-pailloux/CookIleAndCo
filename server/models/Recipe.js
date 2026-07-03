import { DataTypes, Model } from "sequelize";
import sequelize from '../config/database.js';

class Recipe extends Model {
    static associate(models) {
         // belongsTo = la recette porte la clé étrangère category_id
        Recipe.belongsTo(models.Category, {
            foreignKey: 'categoryId', // attribut du modèle (→ colonne category_id)
            as: 'category',  // alias
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