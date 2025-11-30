const fetch = require("node-fetch");
const cheerio = require("cheerio");

// Scraper com paginação para sites com múltiplas páginas.

async function scraperPages(query) {
    const results = [];
    const totalPages = 3; // quantas páginas você quer varrer

    for (let page = 1; page <= totalPages; page++) {
        const url = `https://COLOQUE_A_URL_AQUI/page/${page}`;

        const html = await (await fetch(url)).text();
        const $ = cheerio.load(html);

        $(".ITEM_SELECTOR").each((i, el) => {
            const title = $(el).find(".TITLE_SELECTOR").text().trim();
            const link = $(el).find("a").attr("href");
            const quality = $(el).find(".QUALITY_SELECTOR").text().trim();

            const sizeRaw = $(el).find(".SIZE_SELECTOR").text();
            const sizeMB = sizeRaw
                ? parseInt(sizeRaw.replace(/\D/g, ""))
                : null;

            results.push({
                source: "FontePages",
                title,
                quality,
                sizeMB,
                url: link
            });
        });
    }

    return results.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = { scraperPages };
