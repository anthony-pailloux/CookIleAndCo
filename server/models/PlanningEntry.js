// Recette placée sur un jour et un type de repas d'un planning admin.
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class PlanningEntry extends Model {
    static associate(models) {
        PlanningEntry.belongsTo(models.Admin, {
            foreignKey: 'adminId',
            as: 'admin',
        });
        PlanningEntry.belongsTo(models.Planning, {
            foreignKey: 'planningId',
            as: 'planning',
        });
        PlanningEntry.belongsTo(models.Recipe, {
            foreignKey: 'recipeId',
            as: 'recipe',
        });
        PlanningEntry.belongsTo(models.MealType, {
            foreignKey: 'mealTypeId',
            as: 'mealType',
        });
    }
}

PlanningEntry.init(
    {
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        planningId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        day: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        mealTypeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'PlanningEntry',
        tableName: 'planning_entries',
        underscored: true,
    }
);

export default PlanningEntry;
