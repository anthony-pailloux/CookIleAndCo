import Recipe from '../models/Recipe.js';

export async function listRecipes(req, res) {
    console.log('liste recettes');
    let page = Number(req.query.page);
    let limit = Number(req.query.limit);

    if (!page || page <= 0) {
        page = 1;
    } 
    
    if (!limit || limit <= 0) {
        limit = 12;
    }

    const offset = (page - 1) * limit;

    const result = await Recipe.findAndCountAll({limit, offset}); 

    console.log('listRecipes — page:', page, 'limit:', limit);
    res.status(200).json({
        "recipes": result.rows,
        "count":  result.count,
        "page": page,
        "limit": limit
    });
       

    

    
    
}