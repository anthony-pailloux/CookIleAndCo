// Injecte les balises SEO d une fiche dans le index.html du build React.

import {
    DEFAULT_OG_IMAGE,
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

function replaceCanonical(html, href) {
    const withoutTag = html.replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, '');
    const tag = '<link rel="canonical" id="canonical-link" href="' + escapeHtml(href) + '" />';
    return withoutTag.replace('</head>', '    ' + tag + '\n  </head>');
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

    let imageUrl = absoluteRecipePhotoUrl(data.photo);
    if (imageUrl === '') {
        imageUrl = DEFAULT_OG_IMAGE;
    }

    let nextHtml = html;
    nextHtml = replaceTitle(nextHtml, title);
    nextHtml = replaceMetaName(nextHtml, 'description', description);
    nextHtml = replaceMetaProperty(nextHtml, 'og:title', title);
    nextHtml = replaceMetaProperty(nextHtml, 'og:description', description);
    nextHtml = replaceMetaProperty(nextHtml, 'og:url', canonicalUrl);
    nextHtml = replaceMetaProperty(nextHtml, 'og:image', imageUrl);
    nextHtml = replaceCanonical(nextHtml, canonicalUrl);
    nextHtml = replaceJsonLd(nextHtml, serializeJsonLd(buildRecipeJsonLd(data)));
    return nextHtml;
}

export function injectMissingRecipe(html) {
    if (/<meta\b[^>]*\bname=["']robots["'][^>]*>/i.test(html)) {
        return html;
    }

    return html.replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>');
}
