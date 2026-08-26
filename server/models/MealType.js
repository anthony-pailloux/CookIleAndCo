// Type de repas d une recette (petit dejeuner, diner...).

import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class MealType extends Model {
    static associate(models) {
        // un type de repas a plusieurs de recettes
        MealType.hasMany(models.Recipe, {
            foreignKey: 'mealTypeId',
            as: 'recipes',
        });
    }
}

MealType.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'MealType',
        tableName: 'meal_types',
        underscored: true,
        timestamps: true,
    }
);

export default MealType;
