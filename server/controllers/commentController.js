import Comment from '../models/Comment.js';
import Recipe from '../models/Recipe.js';

export async function listComments(req, res, next) {
  try {
    const recipeId = req.params.id;

    console.log('GET /api/recipes/:id/comments — recipeId:', recipeId);

    const recipe = await Recipe.findByPk(recipeId);

    if (!recipe) {
      res.status(404).json({ error: 'Recette introuvable' });
    } else {
      const comments = await Comment.findAll({
        where: { recipeId: recipeId },
        order: [['createdAt', 'DESC']],
      });

      console.log('GET /api/recipes/:id/comments — count:', comments.length);

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
  
      console.log('POST /api/recipes/:id/comments — body:', req.body);
  
      const recipe = await Recipe.findByPk(recipeId);
  
      if (!recipe) {
        res.status(404).json({ error: 'Recette introuvable' });
      } else {
        const comment = await Comment.create({
          recipeId: recipeId,
          pseudo: pseudo,
          content: content,
        });
  
        console.log('POST /api/recipes/:id/comments — created id:', comment.id);
  
        res.status(201).json(comment);
      }
    } catch (err) {
      next(err);
    }
  }