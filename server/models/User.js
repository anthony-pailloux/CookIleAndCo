// Compte administrateur (email, mot de passe).

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model {

}

User.init(
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
        modelName: 'User',
        tableName: 'users',
        underscored: true,
        timestamps: true,
    }
);

export default User;