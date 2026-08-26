// Compte administrateur (email, mot de passe).

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Admin extends Model {

}

Admin.init(
    {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        passwordHash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'Admin',
        tableName: 'admins',
        underscored: true,
        timestamps: true,
    }
);

export default Admin;
