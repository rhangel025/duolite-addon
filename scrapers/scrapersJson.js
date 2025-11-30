const fetch = require("node-fetch");

// Scraper genérico que funciona com QUALQUER API JSON pública.

async function scraperJSON(query) {
    const url = "https://API_DO_SITE_AQUI/search?q=" + encodeURIComponent(query);

    const response = await fetch(url);
    const data = await response.json();

    const results = [];

    for (const item of data.items || []) {
        results.push({
            source: "FonteJSON",
            title: item.title,
            quality: item.quality,
            sizeMB: item.size,
            url: item.stream_url,
            image: item.thumbnail
        });
    }

    return results;
}

module.exports = { scraperJSON };
