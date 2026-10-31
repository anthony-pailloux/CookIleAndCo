// Titre, description et JSON-LD d une fiche recette.
// La meme logique existe cote client dans client/src/utils/recipeSeo.js.

const SITE_ORIGIN = 'https://www.cookileandco.fr';
const DEFAULT_OG_IMAGE = SITE_ORIGIN + '/og-cook-ile-co-cuisine-des-saveurs-du-monde.jpg';

function isSpace(character) {
    if (character === ' ' || character === '\n' || character === '\r' || character === '\t') {
        return true;
    }

    if (character === '\u00a0') {
        return true;
    }

    return false;
}

function cleanWhitespace(value) {
    let result = '';
    let previousWasSpace = false;

    for (let index = 0; index < value.length; index++) {
        const character = value[index];

        if (isSpace(character)) {
            if (previousWasSpace === false && result !== '') {
                result = result + ' ';
                previousWasSpace = true;
            }
        } else {
            result = result + character;
            previousWasSpace = false;
        }
    }

    return result.trim();
}

function truncateText(value, maxLength) {
    if (value.length <= maxLength) {
        return value;
    }

    let cut = value.slice(0, maxLength - 3);
    cut = cut.trim();
    return cut + '...';
}

function toIsoDuration(minutes) {
    let value = minutes;

    if (typeof value === 'string') {
        if (value.trim() === '') {
            return '';
        }

        value = Number(value);
    }

    if (typeof value !== 'number') {
        return '';
    }

    if (Number.isNaN(value) || value < 0) {
        return '';
    }

    return 'PT' + Math.round(value) + 'M';
}

function formatDateOnly(value) {
    if (value === null || value === undefined || value === '') {
        return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const year = String(date.getFullYear());

    let month = String(date.getMonth() + 1);
    if (month.length === 1) {
        month = '0' + month;
    }

    let day = String(date.getDate());
    if (day.length === 1) {
        day = '0' + day;
    }

    return year + '-' + month + '-' + day;
}

function formatIngredientLine(ingredient) {
    const parts = [];

    if (ingredient.quantity !== null && ingredient.quantity !== undefined && String(ingredient.quantity) !== '') {
        parts.push(String(ingredient.quantity));
    }

    if (ingredient.unit !== null && ingredient.unit !== undefined && String(ingredient.unit) !== '') {
        parts.push(String(ingredient.unit));
    }

    if (ingredient.name !== null && ingredient.name !== undefined && String(ingredient.name) !== '') {
        parts.push(String(ingredient.name));
    }

    let line = '';

    for (let index = 0; index < parts.length; index++) {
        if (line !== '') {
            line = line + ' ';
        }

        line = line + parts[index];
    }

    return line;
}

function copyAndSort(list, fieldName) {
    const copy = [];

    if (!list) {
        return copy;
    }

    for (let index = 0; index < list.length; index++) {
        copy.push(list[index]);
    }

    copy.sort(function (left, right) {
        let leftValue = 0;
        let rightValue = 0;

        if (left[fieldName] !== null && left[fieldName] !== undefined) {
            leftValue = left[fieldName];
        }

        if (right[fieldName] !== null && right[fieldName] !== undefined) {
            rightValue = right[fieldName];
        }

        return leftValue - rightValue;
    });

    return copy;
}

export function toPlainRecipe(recipe) {
    if (recipe !== null && recipe !== undefined && typeof recipe.toJSON === 'function') {
        return recipe.toJSON();
    }

    return recipe;
}

export function absoluteRecipePhotoUrl(photo) {
    if (photo === null || photo === undefined || photo === '') {
        return '';
    }

    const value = String(photo);

    if (value.startsWith('https://') || value.startsWith('http://')) {
        return value;
    }

    if (value.startsWith('/')) {
        return SITE_ORIGIN + value;
    }

    return SITE_ORIGIN + '/' + value;
}

export function buildRecipeTitle(recipe) {
    return recipe.title + " | Cook'île & Co";
}

export function buildRecipeDescription(recipe) {
    let source = '';

    if (recipe.tips !== null && recipe.tips !== undefined && String(recipe.tips).trim() !== '') {
        source = cleanWhitespace(String(recipe.tips));
    }

    if (source === '') {
        source = recipe.title + " — recette Cook'île & Co";
    }

    return truncateText(source, 160);
}

export function buildRecipeCanonicalUrl(id) {
    return SITE_ORIGIN + '/recettes/' + id;
}

export function buildRecipeJsonLd(recipe) {
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        description: buildRecipeDescription(recipe),
    };

    const imageUrl = absoluteRecipePhotoUrl(recipe.photo);
    if (imageUrl !== '') {
        data.image = imageUrl;
    }

    const ingredientLines = [];
    const ingredients = copyAndSort(recipe.ingredients, 'sortOrder');

    for (let index = 0; index < ingredients.length; index++) {
        const line = formatIngredientLine(ingredients[index]);

        if (line !== '') {
            ingredientLines.push(line);
        }
    }

    if (ingredientLines.length > 0) {
        data.recipeIngredient = ingredientLines;
    }

    const instructions = [];
    const steps = copyAndSort(recipe.steps, 'stepNumber');

    for (let index = 0; index < steps.length; index++) {
        const step = steps[index];

        if (step.description === null || step.description === undefined || String(step.description) === '') {
            continue;
        }

        let position = index + 1;
        if (step.stepNumber !== null && step.stepNumber !== undefined) {
            position = step.stepNumber;
        }

        instructions.push({
            '@type': 'HowToStep',
            position: position,
            text: String(step.description),
        });
    }

    if (instructions.length > 0) {
        data.recipeInstructions = instructions;
    }

    const prepTime = toIsoDuration(recipe.preparationTime);
    if (prepTime !== '') {
        data.prepTime = prepTime;
    }

    const cookTime = toIsoDuration(recipe.cookingTime);
    if (cookTime !== '') {
        data.cookTime = cookTime;
    }

    const dateModified = formatDateOnly(recipe.updatedAt);
    if (dateModified !== '') {
        data.dateModified = dateModified;
    }

    return data;
}

export function escapeHtml(value) {
    const text = String(value);
    let escaped = '';

    for (let index = 0; index < text.length; index++) {
        const character = text[index];

        if (character === '&') {
            escaped = escaped + '&amp;';
        } else if (character === '<') {
            escaped = escaped + '&lt;';
        } else if (character === '>') {
            escaped = escaped + '&gt;';
        } else if (character === '"') {
            escaped = escaped + '&quot;';
        } else if (character === "'") {
            escaped = escaped + '&#39;';
        } else {
            escaped = escaped + character;
        }
    }

    return escaped;
}

export function serializeJsonLd(data) {
    let json = JSON.stringify(data);
    json = json.replace(/</g, '\\u003c');
    return json;
}

export function escapeXml(value) {
    const text = String(value);
    let escaped = '';

    for (let index = 0; index < text.length; index++) {
        const character = text[index];

        if (character === '&') {
            escaped = escaped + '&amp;';
        } else if (character === '<') {
            escaped = escaped + '&lt;';
        } else if (character === '>') {
            escaped = escaped + '&gt;';
        } else if (character === '"') {
            escaped = escaped + '&quot;';
        } else if (character === "'") {
            escaped = escaped + '&apos;';
        } else {
            escaped = escaped + character;
        }
    }

    return escaped;
}

export function formatSitemapDate(value) {
    return formatDateOnly(value);
}

export { SITE_ORIGIN, DEFAULT_OG_IMAGE };
