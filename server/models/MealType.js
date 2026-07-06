import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class MealType extends Model {
    static associate(models) {
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
