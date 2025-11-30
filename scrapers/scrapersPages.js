const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function scrape(query) {
    const results = [];
    const totalPages = 3;

    for (let page = 1; page <= totalPages; page++) {
        const url = `https://SITE_AQUI/page/${page}`;

        const html = await (await fetch(url)).text();
        const $ = cheerio.load(html);

        $(".ITEM_SELECTOR").each((i, el) => {
            const title = $(el).find(".TITLE_SELECTOR").text().trim();
            const link = $(el).find("a").attr("href");

            results.push({
                source: "PAGES",
                title,
                quality: "HD",
                sizeMB: 1000,
                url: link
            });
        });
    }

    return results.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = { scrape };
