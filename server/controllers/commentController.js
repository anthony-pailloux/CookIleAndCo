// Requetes BDD pour les commentaires.
import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';

export async function listComments(req, res, next) {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) {
      res.status(404).json({ error: 'Recette introuvable' });
    } else {
      const comments = await Comment.findAll({
        where: { recipeId: recipeId },
        order: [['createdAt', 'DESC']],
      });

      res.json(comments);
    }
  } catch (err) {
    next(err);
  }
}

export async function createComment(req, res, next) {
  try {
    const recipeId = req.params.id;
    const pseudo = req.body.pseudo;
    const content = req.body.content;
    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) {
      res.status(404).json({ error: 'Recette introuvable' });
    } else {
      const comment = await Comment.create({
        recipeId: recipeId,
        pseudo: pseudo,
        content: content,
      });

      res.status(201).json(comment);
    }
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(req, res, next) {
  try {
    const recipeId = req.params.id;
    const commentId = req.params.commentId;

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        recipeId: recipeId,
      },
    });

    if (!comment) {
      res.status(404).json({ error: 'Commentaire introuvable' });
    } else {
      await comment.destroy();
      res.status(200).json({ message: 'Commentaire supprimé' });
    }
  } catch (err) {
    next(err);
  }
}