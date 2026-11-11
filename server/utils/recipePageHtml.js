// Injecte les balises SEO d une fiche dans le index.html du build React.

import {
    BRAND_OG_IMAGE_HEIGHT,
    BRAND_OG_IMAGE_WIDTH,
    DEFAULT_OG_IMAGE,
    SITE_ORIGIN,
    absoluteRecipePhotoUrl,
    buildRecipeCanonicalUrl,
    buildRecipeDescription,
    buildRecipeJsonLd,
    buildRecipeTitle,
    escapeHtml,
    serializeJsonLd,
    toPlainRecipe,
} from './recipeSeo.js';

function replaceTitle(html, title) {
    const tag = '<title>' + escapeHtml(title) + '</title>';

    if (/<title\b[^>]*>[\s\S]*?<\/title>/i.test(html)) {
        return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, tag);
    }

    return html.replace('</head>', '    ' + tag + '\n  </head>');
}

function replaceMetaName(html, name, content) {
    const pattern = new RegExp('<meta\\b[^>]*\\bname=["\']' + name + '["\'][^>]*>', 'gi');
    const withoutTag = html.replace(pattern, '');
    const tag = '<meta name="' + name + '" content="' + escapeHtml(content) + '" />';
    return withoutTag.replace('</head>', '    ' + tag + '\n  </head>');
}

function replaceMetaProperty(html, property, content) {
    const pattern = new RegExp('<meta\\b[^>]*\\bproperty=["\']' + property + '["\'][^>]*>', 'gi');
    const withoutTag = html.replace(pattern, '');
    const tag = '<meta property="' + property + '" content="' + escapeHtml(content) + '" />';
    return withoutTag.replace('</head>', '    ' + tag + '\n  </head>');
}

function removeMetaName(html, name) {
    const pattern = new RegExp('<meta\\b[^>]*\\bname=["\']' + name + '["\'][^>]*>', 'gi');
    return html.replace(pattern, '');
}

function removeMetaProperty(html, property) {
    const pattern = new RegExp('<meta\\b[^>]*\\bproperty=["\']' + property + '["\'][^>]*>', 'gi');
    return html.replace(pattern, '');
}

function replaceCanonical(html, href) {
    const withoutTag = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, '');
    const tag = '<link rel="canonical" id="canonical-link" href="' + escapeHtml(href) + '" />';
    return withoutTag.replace('</head>', '    ' + tag + '\n  </head>');
}

function removeCanonical(html) {
    return html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, '');
}

function replaceJsonLd(html, json) {
    const withoutTag = html.replace(/<script\b[^>]*\bid=["']recipe-jsonld["'][^>]*>[\s\S]*?<\/script>/gi, '');
    const tag = '<script type="application/ld+json" id="recipe-jsonld">' + json + '</script>';
    return withoutTag.replace('</head>', '    ' + tag + '\n  </head>');
}

export function injectRecipeSeo(html, recipe) {
    const data = toPlainRecipe(recipe);
    const title = buildRecipeTitle(data);
    const description = buildRecipeDescription(data);
    const canonicalUrl = buildRecipeCanonicalUrl(data.id);

    // Photo de la recette si elle existe, sinon l'image de marque (URL absolue).
    let imageUrl = absoluteRecipePhotoUrl(data.photo);
    let imageIsBrand = false;

    if (imageUrl === '') {
        imageUrl = DEFAULT_OG_IMAGE;
        imageIsBrand = true;
    }

    let imageAlt = title;
    if (data.title !== null && data.title !== undefined && String(data.title).trim() !== '') {
        imageAlt = String(data.title).trim();
    }

    // X : grande carte seulement pour l'image de marque 1200×630.
    // Photo de taille inconnue : carte summary. Sans image : pas de summary_large_image.
    let twitterCard = 'summary';

    if (imageUrl === '') {
        twitterCard = '';
        imageIsBrand = false;
    } else if (imageIsBrand === true) {
        twitterCard = 'summary_large_image';
    }

    let nextHtml = html;
    nextHtml = replaceTitle(nextHtml, title);
    nextHtml = replaceMetaName(nextHtml, 'description', description);
    nextHtml = replaceMetaProperty(nextHtml, 'og:type', 'article');
    nextHtml = replaceMetaProperty(nextHtml, 'og:locale', 'fr_FR');
    nextHtml = replaceMetaProperty(nextHtml, 'og:site_name', "Cook'île & Co");
    nextHtml = replaceMetaProperty(nextHtml, 'og:title', title);
    nextHtml = replaceMetaProperty(nextHtml, 'og:description', description);
    nextHtml = replaceMetaProperty(nextHtml, 'og:url', canonicalUrl);

    if (imageUrl === '') {
        nextHtml = removeMetaProperty(nextHtml, 'og:image');
        nextHtml = removeMetaProperty(nextHtml, 'og:image:alt');
        nextHtml = removeMetaProperty(nextHtml, 'og:image:width');
        nextHtml = removeMetaProperty(nextHtml, 'og:image:height');
        nextHtml = removeMetaName(nextHtml, 'twitter:image');
    } else {
        nextHtml = replaceMetaProperty(nextHtml, 'og:image', imageUrl);
        nextHtml = replaceMetaProperty(nextHtml, 'og:image:alt', imageAlt);
        nextHtml = replaceMetaName(nextHtml, 'twitter:image', imageUrl);

        // Largeur et hauteur seulement pour l'image de marque, jamais inventées sur un upload.
        if (imageIsBrand === true) {
            nextHtml = replaceMetaProperty(nextHtml, 'og:image:width', String(BRAND_OG_IMAGE_WIDTH));
            nextHtml = replaceMetaProperty(nextHtml, 'og:image:height', String(BRAND_OG_IMAGE_HEIGHT));
        } else {
            nextHtml = removeMetaProperty(nextHtml, 'og:image:width');
            nextHtml = removeMetaProperty(nextHtml, 'og:image:height');
        }
    }

    if (twitterCard === '') {
        nextHtml = removeMetaName(nextHtml, 'twitter:card');
    } else {
        nextHtml = replaceMetaName(nextHtml, 'twitter:card', twitterCard);
    }

    nextHtml = replaceMetaName(nextHtml, 'twitter:title', title);
    nextHtml = replaceMetaName(nextHtml, 'twitter:description', description);
    nextHtml = replaceCanonical(nextHtml, canonicalUrl);
    nextHtml = replaceJsonLd(nextHtml, serializeJsonLd(buildRecipeJsonLd(data)));
    return nextHtml;
}

// Titre et canonical de l'accueil. La description déjà dans index.html reste.
export function injectHomeSeo(html) {
    const title = "Cook'île & Co | Des Antilles aux saveurs du monde";
    const canonicalUrl = SITE_ORIGIN + '/';
    let nextHtml = html;
    nextHtml = replaceTitle(nextHtml, title);
    nextHtml = replaceCanonical(nextHtml, canonicalUrl);
    return nextHtml;
}

// Titre et canonical d'une page fixe. La description du index.html reste.
export function injectPageSeo(html, title, path) {
    const canonicalUrl = SITE_ORIGIN + path;
    let nextHtml = html;
    nextHtml = replaceTitle(nextHtml, title);
    nextHtml = replaceCanonical(nextHtml, canonicalUrl);
    return nextHtml;
}

// noindex seul. Le canonical déjà posé n'est pas retiré.
export function injectRobotsNoindex(html) {
    return replaceMetaName(html, 'robots', 'noindex');
}

// Recette absente ou id invalide : titre dédié, noindex, pas de canonical.
export function injectMissingRecipe(html) {
    let nextHtml = html;
    nextHtml = replaceTitle(nextHtml, "Recette introuvable | Cook'île & Co");
    nextHtml = injectRobotsNoindex(nextHtml);
    nextHtml = removeCanonical(nextHtml);
    return nextHtml;
}

// URL inconnue : même traitement, sans pointer le canonical vers cette URL.
export function injectNotFoundPage(html) {
    let nextHtml = html;
    nextHtml = replaceTitle(nextHtml, "Page introuvable | Cook'île & Co");
    nextHtml = injectRobotsNoindex(nextHtml);
    nextHtml = removeCanonical(nextHtml);
    return nextHtml;
}

// Connexion et dashboard : titre sobre, noindex, pas de canonical vers l'admin.
export function injectAdminPage(html, title) {
    let nextHtml = html;
    nextHtml = replaceTitle(nextHtml, title);
    nextHtml = injectRobotsNoindex(nextHtml);
    nextHtml = removeCanonical(nextHtml);
    return nextHtml;
}
