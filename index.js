const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const { searchRedetorrent } = require("./scrapers/redetorrent");
const { searchVacatorrent } = require("./scrapers/vacatorrent");
const { applyFilters } = require("./utils/filter");
const cache = require("./utils/cache");

// Manifesto do addon
const manifest = {
  id: "duolite-addon",
  version: "1.0.0",
  name: "Duo Lite",
  description: "Addon estilo Brazuca usando fontes múltiplas (demo)",
  logo: "https://i.postimg.cc/KYBymfrP/duolite.png",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: []
};

const builder = new addonBuilder(manifest);

// Handler de streams
builder.defineStreamHandler(async ({ type, id }) => {
  console.log("Pedido de stream:", { type, id });

  const cacheKey = `${type}:${id}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log("Cache HIT:", cacheKey);
    return { streams: cached };
  }

  console.log("Cache MISS:", cacheKey);

  let results = [];

  try {
    const r1 = await searchRedetorrent({ type, id });
    const r2 = await searchVacatorrent({ type, id });
    results = [...r1, ...r2];
  } catch (err) {
    console.error("Erro nos scrapers:", err);
  }

  results = applyFilters(results);

  const streams = results
    .filter(r => r.magnet || r.url)
    .map(r => ({
      name: `Duo Lite • ${r.source || "Fonte"}`,
      type: r.magnet ? "torrent" : "url",
      url: r.magnet || r.url
    }));

  cache.set(cacheKey, streams, 3600); // 1 hora

  return { streams };
});

// Sobe servidor HTTP da SDK
const PORT = process.env.PORT || 7000;

serveHTTP(builder.getInterface(), { port: PORT });

console.log(`Duo Lite addon rodando na porta ${PORT}`);
console.log("Use a URL /manifest.json no Stremio.");
