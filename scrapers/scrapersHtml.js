const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function scrape(query) {
    // A URL de busca no site Rede Torrent é construída com o parâmetro 's'
    const url = `https://redetorrent.com/index.php?s=${encodeURIComponent(query)}`;

    try {
        // Nota: Em ambientes Node.js mais recentes, pode ser necessário usar 'const fetch = require("node-fetch");'
        // ou 'const fetch = require("node-fetch").default;' dependendo da versão.
        const html = await (await fetch(url)).text();
        const $ = cheerio.load(html);

        const results = [];

        // Seletor para cada item de resultado na página de busca: .item
        $(".item").each((i, el) => {
            // O título e o link estão dentro de um <a> que está dentro de um <h3>
            const titleElement = $(el).find("h3 a");
            const title = titleElement.text().trim();
            const link = titleElement.attr("href");

            // Tentativa de extrair a qualidade a partir dos elementos de tag (.tag-q)
            const qualityElement = $(el).find(".tag-q");
            let quality = "HD"; // Valor padrão conforme solicitado

            if (qualityElement.length) {
                quality = qualityElement.text().trim();
            } else {
                // Tenta inferir do título se a tag não for encontrada
                if (title.includes("4K")) quality = "4K";
                else if (title.includes("1080P")) quality = "1080P";
                else if (title.includes("720P")) quality = "720P";
            }

            // O tamanho (sizeMB) é um valor que você decide, conforme o código original
            const sizeMB = 800; // Valor placeholder

            results.push({
                source: "Rede Torrent",
                title,
                quality,
                sizeMB,
                url: link
            });
        });

        // Filtra os resultados pelo termo de busca (query)
        return results.filter(r =>
            r.title.toLowerCase().includes(query.toLowerCase())
        );
    } catch (error) {
        console.error("Erro ao fazer scraping:", error);
        return [];
    }
}

module.exports = { scrape };
