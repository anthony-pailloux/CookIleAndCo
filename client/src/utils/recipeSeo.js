// Met a jour titre, description, canonical, Open Graph, Twitter et JSON-LD.
// Aligne sur server/utils/recipeSeo.js (pas de module partage : Vite et Express sont separes).

const SITE_ORIGIN = 'https://www.cookileandco.fr';
const DEFAULT_OG_IMAGE = SITE_ORIGIN + '/og-cook-ile-co-cuisine-des-saveurs-du-monde.jpg';
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
    const lastSpace = cut.lastIndexOf(' ');

    // Coupe sur un mot quand c'est possible.
    if (lastSpace > 20) {
        cut = cut.slice(0, lastSpace);
    }

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

function readLinkedName(linked) {
    if (linked === null || linked === undefined) {
        return '';
    }

    if (linked.name === null || linked.name === undefined) {
        return '';
    }

    return cleanWhitespace(String(linked.name));
}

function formatMinutesLabel(minutes) {
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

    if (Number.isNaN(value) || value <= 0) {
        return '';
    }

    return String(Math.round(value)) + ' min';
}

function firstSentence(value) {
    const text = cleanWhitespace(String(value));

    if (text === '') {
        return '';
    }

    let endIndex = -1;

    for (let index = 0; index < text.length; index++) {
        const character = text[index];

        if (character === '.' || character === '!' || character === '?') {
            endIndex = index;
            break;
        }
    }

    let sentence = text;

    if (endIndex !== -1) {
        sentence = text.slice(0, endIndex + 1).trim();
    }

    if (sentence.length > 140) {
        sentence = truncateText(sentence, 140);
    }

    return sentence;
}

function buildRecipeKeywords(recipe) {
    const categoryName = readLinkedName(recipe.category);
    const originName = readLinkedName(recipe.origin);
    const mealTypeName = readLinkedName(recipe.mealType);
    const parts = [];

    if (categoryName !== '') {
        parts.push('catégorie ' + categoryName);
    }

    if (originName !== '') {
        parts.push('origine ' + originName);
    }

    if (mealTypeName !== '') {
        parts.push('repas ' + mealTypeName);
    }

    let keywords = '';

    for (let index = 0; index < parts.length; index++) {
        if (keywords !== '') {
            keywords = keywords + ', ';
        }

        keywords = keywords + parts[index];
    }

    return keywords;
}

function buildRecipeDescription(recipe) {
    let title = '';

    if (recipe.title !== null && recipe.title !== undefined && String(recipe.title).trim() !== '') {
        title = cleanWhitespace(String(recipe.title));
    }

    if (title === '') {
        title = "Recette Cook'île & Co";
    }

    const originName = readLinkedName(recipe.origin);
    const categoryName = readLinkedName(recipe.category);
    let description = title;

    if (originName !== '') {
        description = description + ', origine ' + originName;
    }

    if (categoryName !== '') {
        description = description + ', catégorie ' + categoryName;
    }

    description = description + '.';

    const preparationLabel = formatMinutesLabel(recipe.preparationTime);
    const cookingLabel = formatMinutesLabel(recipe.cookingTime);

    if (preparationLabel !== '' && cookingLabel !== '') {
        description = description + ' Préparation ' + preparationLabel + ', cuisson ' + cookingLabel + '.';
    } else if (preparationLabel !== '') {
        description = description + ' Préparation ' + preparationLabel + '.';
    } else if (cookingLabel !== '') {
        description = description + ' Cuisson ' + cookingLabel + '.';
    }

    let tipsSentence = '';

    if (recipe.tips !== null && recipe.tips !== undefined && String(recipe.tips).trim() !== '') {
        tipsSentence = firstSentence(String(recipe.tips));
    }

    if (tipsSentence !== '') {
        const tipsCompare = tipsSentence.toLowerCase();
        const descriptionCompare = description.toLowerCase();
        let tipsAlreadySaid = false;

        if (descriptionCompare.indexOf(tipsCompare) !== -1) {
            tipsAlreadySaid = true;
        }

        if (tipsAlreadySaid === false) {
            description = description + ' ' + tipsSentence;
        }
    }

    if (cleanWhitespace(description) === '') {
        description = "Recette Cook'île & Co";
    }

    return description;
}

export function buildRecipeCanonicalUrl(id) {
    return SITE_ORIGIN + '/recettes/' + id;
}

function buildRecipeJsonLd(recipe) {
    // Aucun nom d'auteur n'est stocké sur la recette : la marque signe le schéma.
    const data = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        description: buildRecipeDescription(recipe),
        inLanguage: 'fr',
        author: {
            '@type': 'Organization',
            name: "Cook'île & Co",
        },
    };

    const imageUrl = absoluteRecipePhotoUrl(recipe.photo);
    if (imageUrl !== '') {
        data.image = imageUrl;
    }

    const categoryName = readLinkedName(recipe.category);
    if (categoryName !== '') {
        data.recipeCategory = categoryName;
    }

    const originName = readLinkedName(recipe.origin);
    if (originName !== '') {
        data.recipeCuisine = originName;
    }

    // Recipe n'a pas de propriété standard pour le type de repas.
    const keywords = buildRecipeKeywords(recipe);
    if (keywords !== '') {
        data.keywords = keywords;
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

    const datePublished = formatDateOnly(recipe.createdAt);
    if (datePublished !== '') {
        data.datePublished = datePublished;
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

// Crée ou met à jour une balise <meta property="...">.
function upsertMetaProperty(property, content) {
    let meta = document.querySelector('meta[property="' + property + '"]');

    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
    }

    meta.setAttribute('content', content);
}

// Crée ou met à jour une balise <meta name="..."> (Twitter).
function upsertMetaName(name, content) {
    let meta = document.querySelector('meta[name="' + name + '"]');

    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
    }

    meta.setAttribute('content', content);
}

function removeMetaProperty(property) {
    const meta = document.querySelector('meta[property="' + property + '"]');

    if (meta) {
        meta.remove();
    }
}

function removeMetaName(name) {
    const meta = document.querySelector('meta[name="' + name + '"]');

    if (meta) {
        meta.remove();
    }
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
    const title = buildRecipeTitle(recipe);
    const description = buildRecipeDescription(recipe);
    const canonicalUrl = buildRecipeCanonicalUrl(recipe.id);

    let imageUrl = absoluteRecipePhotoUrl(recipe.photo);
    if (imageUrl === '') {
        imageUrl = DEFAULT_OG_IMAGE;
    }

    document.title = title;
    upsertMetaDescription(description);
    upsertCanonical(canonicalUrl);
    upsertMetaProperty('og:title', title);
    upsertMetaProperty('og:description', description);
    upsertMetaProperty('og:url', canonicalUrl);
    upsertMetaProperty('og:image', imageUrl);
    upsertMetaProperty('og:type', 'article');
    upsertMetaProperty('og:locale', 'fr_FR');
    upsertMetaName('twitter:card', 'summary_large_image');
    upsertMetaName('twitter:title', title);
    upsertMetaName('twitter:description', description);
    upsertJsonLd(recipe);
}

export function restoreDefaultDocumentSeo() {
    document.title = DEFAULT_TITLE;
    upsertMetaDescription(DEFAULT_DESCRIPTION);
    // Retour aux balises de la marque. Les balises propres à la fiche sont retirées.
    upsertMetaProperty('og:title', DEFAULT_TITLE);
    upsertMetaProperty('og:description', DEFAULT_DESCRIPTION);
    upsertMetaProperty('og:image', DEFAULT_OG_IMAGE);
    removeMetaProperty('og:url');
    removeMetaProperty('og:type');
    removeMetaProperty('og:locale');
    removeMetaName('twitter:card');
    removeMetaName('twitter:title');
    removeMetaName('twitter:description');

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
