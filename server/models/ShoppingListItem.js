// Article enregistré d'une liste de courses (copie figée).
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class ShoppingListItem extends Model {
    static associate(models) {
        ShoppingListItem.belongsTo(models.ShoppingList, {
            foreignKey: 'shoppingListId',
            as: 'shoppingList',
        });
    }
}

ShoppingListItem.init(
    {
        shoppingListId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        note: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        sortOrder: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'ShoppingListItem',
        tableName: 'shopping_list_items',
        underscored: true,
        timestamps: false,
    }
);

export default ShoppingListItem;
