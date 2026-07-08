// compte utilisateur

import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model {
    static associate(models) {

    }
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
        role: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user', // user ou admin
            validate: {
                isIn: [['user', 'admin']],
            },
        },
        profilePhoto: {
            type: DataTypes.STRING,
            allowNull: true,
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