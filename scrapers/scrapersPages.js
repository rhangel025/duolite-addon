const fetch = require("node-fetch");
const cheerio = require("cheerio");

async function scrape(query) {
    const results = [];
    const totalPages = 3; // Limitar a 3 páginas para evitar sobrecarga e timeout

    for (let page = 1; page <= totalPages; page++) {
        // A URL de busca paginada é: https://redetorrent.com/index.php?s=QUERY&paged=PAGINA
        const url = `https://redetorrent.com/index.php?s=${encodeURIComponent(query)}&paged=${page}`;

        try {
            const html = await (await fetch(url)).text();
            const $ = cheerio.load(html);

            // Seletor para cada item de resultado: .item
            const items = $(".item");

            // Se não houver itens, ou se for a primeira página e não houver itens,
            // assume-se que não há mais resultados e interrompe o loop.
            if (items.length === 0 && page > 1) {
                break;
            } else if (items.length === 0 && page === 1) {
                // Se não houver resultados na primeira página, não há o que buscar.
                break;
            }

            items.each((i, el) => {
                // O título e o link estão dentro de um <a> que está dentro de um <h3>
                const titleElement = $(el).find("h3 a");
                const title = titleElement.text().trim();
                const link = titleElement.attr("href");

                // Tentativa de extrair a qualidade a partir dos elementos de tag (.tag-q)
                const qualityElement = $(el).find(".tag-q");
                let quality = "HD"; // Valor padrão

                if (qualityElement.length) {
                    quality = qualityElement.text().trim();
                } else {
                    // Tenta inferir do título se a tag não for encontrada
                    if (title.includes("4K")) quality = "4K";
                    else if (title.includes("1080P")) quality = "1080P";
                    else if (title.includes("720P")) quality = "720P";
                }

                results.push({
                    source: "Rede Torrent (Paginado)",
                    title,
                    quality,
                    sizeMB: 1000, // Valor placeholder
                    url: link
                });
            });
        } catch (error) {
            console.error(`Erro ao buscar página ${page}:`, error);
            // Continua para a próxima página em caso de erro
        }
    }

    // Filtra os resultados pelo termo de busca (query)
    return results.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase())
    );
}

module.exports = { scrape };
