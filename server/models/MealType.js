import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class MealType extends Model {
    static associate(models) {

    }
}

MealType.init(
    {
        name: {
            type: DataTypes.STRING,
            allowwNull: false,
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
