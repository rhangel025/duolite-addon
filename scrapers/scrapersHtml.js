const fetch = require("node-fetch");
const cheerio = require("cheerio");

// Scraper HTML genérico para QUALQUER site permitido.
// Só mudar URL e seletores.

async function scraperHTML(query) {
    const url = "https://COLOQUE_A_URL_DO_SITE_AQUI";

    const html = await (await fetch(url)).text();
    const $ = cheerio.load(html);

    const results = [];

    // Troque ".ITEM_SELECTOR" pelos cards do site
    $(".ITEM_SELECTOR").each((i, el) => {
        const title = $(el).find(".TITLE_SELECTOR").text().trim();
        const link = $(el).find("a").attr("href");
        const image = $(el).find("img").attr("src");

        const quality = $(el).find(".QUALITY_SELECTOR").text().trim();
        const sizeRaw = $(el).find(".SIZE_SELECTOR").text().trim();

        const sizeMB = sizeRaw ? parseInt(sizeRaw.replace(/\D/g, "")) : null;

        results.push({
            source: "FonteHTML",
            title,
            quality,
            sizeMB,
            url: link,
            image
        });
    });

    return results.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = { scraperHTML };
