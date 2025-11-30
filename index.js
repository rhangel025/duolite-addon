const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const scrapeAll = require("./scrapers");  // Scraper Manager
const { applyFilters } = require("./utils/filter");
const cache = require("./utils/cache");
const { scoreResult, formatStreamName } = require("./utils/quality");

// Manifesto
const manifest = {
  id: "duolite-addon",
  version: "2.0.0",
  name: "Duo Lite",
  description: "Addon com múltiplas fontes controladas automaticamente pelo Scraper Manager.",
  logo: "https://i.postimg.cc/KYBymfrP/duolite.png",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: []
};

const builder = new addonBuilder(manifest);

// Handler principal
builder.defineStreamHandler(async ({ type, id }) => {
  console.log("Stream solicitado:", { type, id });

  const cacheKey = `${type}:${id}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log("CACHE HIT:", cacheKey);
    return { streams: cached };
  }

  console.log("CACHE MISS:", cacheKey);

  let results = [];

  try {
    results = await scrapeAll(id);   // Agora é automático!
  } catch (err) {
    console.error("Erro no Scraper Manager:", err);
  }

  results = applyFilters(results);
  results.sort((a, b) => scoreResult(b) - scoreResult(a));

  const streams = results
    .filter(r => r.url || r.magnet)
    .map(r => ({
      name: formatStreamName(r),
      type: r.magnet ? "torrent" : "url",
      url: r.magnet || r.url
    }));

  cache.set(cacheKey, streams, 3600);

  return { streams };
});

// Servidor
const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log(`Duo Lite rodando na porta ${PORT}`);
console.log("Use /manifest.json no Stremio.");
