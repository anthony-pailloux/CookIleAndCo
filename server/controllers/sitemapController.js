// Sitemap XML. En prod (Passenger / o2switch), les fiches viennent de la BDD.
// En local, seulement les 3 pages fixes : les id Laragon ne sont pas ceux du site.

import Recipe from '../models/Recipe.js';
import { SITE_ORIGIN, escapeXml, formatSitemapDate } from '../utils/recipeSeo.js';

function renderUrl(entry) {
    let block = '  <url>\n';
    block = block + '    <loc>' + escapeXml(entry.loc) + '</loc>\n';

    if (entry.lastmod) {
        block = block + '    <lastmod>' + escapeXml(entry.lastmod) + '</lastmod>\n';
    }

    if (entry.changefreq) {
        block = block + '    <changefreq>' + escapeXml(entry.changefreq) + '</changefreq>\n';
    }

    if (entry.priority) {
        block = block + '    <priority>' + escapeXml(entry.priority) + '</priority>\n';
    }

    block = block + '  </url>\n';
    return block;
}

export async function getSitemap(req, res) {
    // NODE_ENV n'est pas posé dans ce projet. Le même test que server.js :
    // PhusionPassenger n'existe que lorsque Node tourne chez o2switch.
    let recipes;

    if (typeof PhusionPassenger !== 'undefined') {
        recipes = await Recipe.findAll({
            attributes: ['id', 'updatedAt'],
            order: [['id', 'ASC']],
        });
    } else {
        recipes = [];
    }

    const staticPages = [
        {
            loc: SITE_ORIGIN + '/',
            changefreq: 'weekly',
            priority: '1.0',
        },
        {
            loc: SITE_ORIGIN + '/recettes',
            changefreq: 'daily',
            priority: '0.9',
        },
        {
            loc: SITE_ORIGIN + '/categories',
            changefreq: 'weekly',
            priority: '0.7',
        },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml = xml + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (let index = 0; index < staticPages.length; index++) {
        xml = xml + renderUrl(staticPages[index]);
    }

    for (let index = 0; index < recipes.length; index++) {
        const recipe = recipes[index];
        xml = xml + renderUrl({
            loc: SITE_ORIGIN + '/recettes/' + recipe.id,
            lastmod: formatSitemapDate(recipe.updatedAt),
        });
    }

    xml = xml + '</urlset>\n';

    res.status(200);
    res.set('Content-Type', 'application/xml; charset=utf-8');
    res.send(xml);
}
