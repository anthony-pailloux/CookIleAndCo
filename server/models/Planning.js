// Planning nommé appartenant à un admin.
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Planning extends Model {
    static associate(models) {
        Planning.belongsTo(models.Admin, {
            foreignKey: 'adminId',
            as: 'admin',
        });
        Planning.hasMany(models.PlanningEntry, {
            foreignKey: 'planningId',
            as: 'entries',
            onDelete: 'CASCADE',
        });
        Planning.hasMany(models.ShoppingList, {
            foreignKey: 'planningId',
            as: 'shoppingLists',
            onDelete: 'SET NULL',
        });
    }
}

Planning.init(
    {
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'Planning',
        tableName: 'plannings',
        underscored: true,
    }
);

export default Planning;
