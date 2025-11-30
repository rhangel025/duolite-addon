// Scraper DEMO Redetorrent
// Aqui a gente ainda não está raspando site real, é só exemplo.
// Depois podemos trocar por scraping de verdade com node-fetch + cheerio.

async function searchRedetorrent({ type, id }) {
  // Exemplo: só responde pra Big Buck Bunny (tt1254207)
  if (type === "movie" && id === "tt1254207") {
    return [
      {
        source: "Redetorrent (Demo)",
        magnet:
          "magnet:?xt=urn:btih:e606fef7ee4bba72bde96e5c8767702b4fef0f06"
      }
    ];
  }

  // Qualquer outro título ainda não tem resultado
  return [];
}

module.exports = { searchRedetorrent };
