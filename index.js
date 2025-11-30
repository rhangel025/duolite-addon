const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const { searchRedetorrent } = require("./scrapers/redetorrent");
const { searchVacatorrent } = require("./scrapers/vacatorrent");
const { applyFilters } = require("./utils/filter");
const cache = require("./utils/cache");
const { scoreResult, formatStreamName } = require("./utils/quality");

// Manifesto do addon
const manifest = {
  id: "duolite-addon",
  version: "1.1.0",
  name: "Duo Lite",
  description: "Addon estilo Brazuca (demo avançado) com múltiplas fontes e ordenação de qualidade.",
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

  // Aplica filtros (remove duplicados por url/magnet)
  results = applyFilters(results);

  // Ordena por score (qualidade + seeds)
  results.sort((a, b) => scoreResult(b) - scoreResult(a));

  // Transforma resultados em streams pro Stremio
  const streams = results
    .filter((r) => r.magnet || r.url)
    .map((r) => ({
      name: formatStreamName(r),
      type: r.magnet ? "torrent" : "url",
      url: r.magnet || r.url
    }));

  cache.set(cacheKey, streams, 3600); // 1 hora de cache

  return { streams };
});

// Sobe servidor HTTP da SDK
const PORT = process.env.PORT || 7000;

serveHTTP(builder.getInterface(), { port: PORT });

console.log(`Duo Lite addon rodando na porta ${PORT}`);
console.log("Use a URL /manifest.json no Stremio.");
