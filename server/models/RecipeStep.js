import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class RecipeStep extends Model {
    static associate(models) {
        RecipeStep.belongsTo(models.Recipe, {
            foreignKey: 'recipeId'
        });
    }
}

RecipeStep.init(
    {
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        stepNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'RecipeStep',
        tableName: 'recipe_steps',
        underscored: true,
        timestamps: false,
    }
);

export default RecipeStep;