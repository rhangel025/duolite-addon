const fetch = require("node-fetch");

async function scrape(query) {
    const url = "https://API_DO_SITE/search?title=" + encodeURIComponent(query);

    const res = await fetch(url);
    const data = await res.json();

    const results = [];

    for (const item of data.items || []) {
        results.push({
            source: "JSON",
            title: item.title,
            quality: item.quality || "HD",
            sizeMB: item.size || null,
            url: item.url
        });
    }

    return results;
}

module.exports = { scrape };
