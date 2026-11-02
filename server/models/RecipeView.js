// Une ligne = une visite de page publique (accueil, catalogue, catégories ou fiche), hors admin.
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class RecipeView extends Model {
    static associate(models) {
        RecipeView.belongsTo(models.Recipe, {
            foreignKey: 'recipeId',
            as: 'recipe',
        });
    }
}

RecipeView.init(
    {
        recipeId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        pageType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    },
    {
        sequelize: sequelize,
        modelName: 'RecipeView',
        tableName: 'recipe_views',
        underscored: true,
        timestamps: true,
    }
);

export default RecipeView;
