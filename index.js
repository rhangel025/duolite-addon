const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const { scraperHTML } = require("./scrapers/scraperHtml");
const { scraperJSON } = require("./scrapers/scraperJson");
const { scraperPages } = require("./scrapers/scraperPages");

const { applyFilters } = require("./utils/filter");
const cache = require("./utils/cache");
const { scoreResult, formatStreamName } = require("./utils/quality");

// Manifesto do addon
const manifest = {
  id: "duolite-addon",
  version: "2.0.0",
  name: "Duo Lite",
  description: "Addon estilo Brazuca (versão avançada com múltiplas fontes).",
  logo: "https://i.postimg.cc/KYBymfrP/duolite.png",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: []
};

const builder = new addonBuilder(manifest);

// Handler dos streams
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
    const r1 = await scraperHTML(id);
    const r2 = await scraperJSON(id);
    const r3 = await scraperPages(id);

    results = [...r1, ...r2, ...r3];
  } catch (err) {
    console.error("Erro nos scrapers:", err);
  }

  // Remove duplicados
  results = applyFilters(results);

  // Ordena por qualidade e seeds
  results.sort((a, b) => scoreResult(b) - scoreResult(a));

  // Monta streams finais para o Stremio
  const streams = results
    .filter(r => r.url || r.magnet)
    .map(r => ({
      name: formatStreamName(r),
      type: r.magnet ? "torrent" : "url",
      url: r.magnet || r.url
    }));

  cache.set(cacheKey, streams, 3600); // 1h cache

  return { streams };
});

// Servidor
const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });
console.log(`Duo Lite rodando na porta ${PORT}`);
