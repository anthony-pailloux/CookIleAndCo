// Liste de courses enregistrée, photo des ingrédients d'un planning.
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ShoppingList extends Model {
    static associate(models) {
        ShoppingList.belongsTo(models.Admin, {
            foreignKey: 'adminId',
            as: 'admin',
        });
        ShoppingList.belongsTo(models.Planning, {
            foreignKey: 'planningId',
            as: 'planning',
        });
        ShoppingList.hasMany(models.ShoppingListItem, {
            foreignKey: 'shoppingListId',
            as: 'items',
            onDelete: 'CASCADE',
        });
    }
}

ShoppingList.init(
    {
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        title: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        planningId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'ShoppingList',
        tableName: 'shopping_lists',
        underscored: true,
    }
);

export default ShoppingList;
