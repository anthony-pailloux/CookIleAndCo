// Commentaire sous une recette.
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Comment extends Model {
  static associate(models) {
    Comment.belongsTo(models.Recipe, {
      foreignKey: 'recipeId',
      as: 'recipe',
    });
  }
}

Comment.init(
  {
    recipeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pseudo: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize: sequelize,
    modelName: 'Comment',
    tableName: 'comments',
    underscored: true,
  }
);

export default Comment;