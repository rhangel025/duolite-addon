const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function scrape(query) {
    const url = "https://COLOQUE_A_URL_AQUI";

    const html = await (await fetch(url)).text();
    const $ = cheerio.load(html);

    const results = [];

    $(".ITEM_SELECTOR").each((i, el) => {
        const title = $(el).find(".TITLE_SELECTOR").text().trim();
        const link = $(el).find("a").attr("href");
        const quality = "HD"; // você decide
        const sizeMB = 800;   // você decide

        results.push({
            source: "HTML",
            title,
            quality,
            sizeMB,
            url: link
        });
    });

    return results.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = { scrape };
