const fetch = require("node-fetch");
const cheerio = require("cheerio"); // Adicionado para análise de HTML

async function scrape(query) {
    // A URL de busca do Vaca Torrent é baseada em HTML.
    const url = `https://vacatorrentmov.com/?s=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url);
        const html = await res.text(); // Ler como texto (HTML)
        const $ = cheerio.load(html);

        const results = [];

        // Seletor para cada item de resultado na página de busca: article.post
        $("article.post").each((i, el) => {
            // O título e o link estão dentro de um <a> que está dentro de um <h2>.entry-title
            const titleElement = $(el).find("h2.entry-title a");
            const title = titleElement.text().trim();
            const link = titleElement.attr("href");

            // A qualidade deve ser inferida do título, pois não há seletor de tag (.tag-q) no Vaca Torrent
            // const qualityElement = $(el).find(".tag-q"); // Removido, não existe no Vaca Torrent
            let quality = "HD"; // Valor padrão conforme solicitado

            
                // Tenta inferir do título se a tag não for encontrada
                if (title.includes("4K")) quality = "4K";
                else if (title.includes("1080P")) quality = "1080P";
                else if (title.includes("720P")) quality = "720P";
            }

            // O tamanho (sizeMB) é um valor que você decide, conforme o código original
            const sizeMB = 800; // Valor placeholder

            results.push({
                source: "Vaca Torrent (Scraping)",
                title,
                quality,
                sizeMB,
                url: link
            });
        });

        // O filtro de busca é feito pelo site, mas mantemos o filtro local para garantir
        return results.filter(r =>
            r.title.toLowerCase().includes(query.toLowerCase())
        );

    } catch (error) {
        console.error("Erro ao fazer scraping:", error);
        return [];
    }
}

module.exports = { scrape };
