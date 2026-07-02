import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Category extends Model {
    static associate(models) {

    }
}

Category.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'Category',
        tableName: 'categories',
        underscored: true,
        timestamps: true,
    }
);

export default Category;