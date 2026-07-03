import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database.js";

class Origin extends Model {
    static associate(models) {
        Origin.hasMany(models.Recipe, {
            foreignKey: 'originId',
            as: 'recipes',
        });
    }
}

Origin.init(
    {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'Origin',
        tableName: 'origins',
        underscored: true,
        timestamps: true,
    }
);

export default Origin;
