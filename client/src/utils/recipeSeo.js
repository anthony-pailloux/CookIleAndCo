// Met a jour titre, description, canonical et JSON-LD dans le navigateur.
// Aligne sur server/utils/recipeSeo.js (pas de module partage : Vite et Express sont separes).

const SITE_ORIGIN = 'https://www.cookileandco.fr';
const DEFAULT_TITLE = "Cook'île & Co";
const DEFAULT_DESCRIPTION = 'Recettes antillaises et saveurs du monde. An Nou Ay !';
const JSON_LD_ID = 'recipe-jsonld';
const CANONICAL_ID = 'canonical-link';

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

function absoluteRecipePhotoUrl(photo) {
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

function buildRecipeTitle(recipe) {
    return recipe.title + " | Cook'île & Co";
}

function buildRecipeDescription(recipe) {
    let source = '';

    if (recipe.tips !== null && recipe.tips !== undefined && String(recipe.tips).trim() !== '') {
        source = cleanWhitespace(String(recipe.tips));
    }

    if (source === '') {
        source = recipe.title + " — recette Cook'île & Co";
    }

    return truncateText(source, 160);
}

function buildRecipeCanonicalUrl(id) {
    return SITE_ORIGIN + '/recettes/' + id;
}

function buildRecipeJsonLd(recipe) {
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

function upsertMetaDescription(content) {
    let descriptionMeta = document.querySelector('meta[name="description"]');

    if (!descriptionMeta) {
        descriptionMeta = document.createElement('meta');
        descriptionMeta.setAttribute('name', 'description');
        document.head.appendChild(descriptionMeta);
    }

    descriptionMeta.setAttribute('content', content);
}

function upsertCanonical(href) {
    let canonicalLink = document.getElementById(CANONICAL_ID);

    if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('id', CANONICAL_ID);
        document.head.appendChild(canonicalLink);
    }

    canonicalLink.setAttribute('href', href);
}

function upsertJsonLd(recipe) {
    let jsonLdScript = document.getElementById(JSON_LD_ID);

    if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.setAttribute('type', 'application/ld+json');
        jsonLdScript.setAttribute('id', JSON_LD_ID);
        document.head.appendChild(jsonLdScript);
    }

    let json = JSON.stringify(buildRecipeJsonLd(recipe));
    json = json.replace(/</g, '\\u003c');
    jsonLdScript.textContent = json;
}

export function applyRecipeDocumentSeo(recipe) {
    document.title = buildRecipeTitle(recipe);
    upsertMetaDescription(buildRecipeDescription(recipe));
    upsertCanonical(buildRecipeCanonicalUrl(recipe.id));
    upsertJsonLd(recipe);
}

export function restoreDefaultDocumentSeo() {
    document.title = DEFAULT_TITLE;
    upsertMetaDescription(DEFAULT_DESCRIPTION);

    const canonicalLink = document.getElementById(CANONICAL_ID);
    if (canonicalLink) {
        canonicalLink.remove();
    }

    const jsonLdScript = document.getElementById(JSON_LD_ID);
    if (jsonLdScript) {
        jsonLdScript.remove();
    }
}

export function removeNoindexMeta() {
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
        return;
    }

    const content = robotsMeta.getAttribute('content');
    if (content === 'noindex') {
        robotsMeta.remove();
    }
}
