const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const scrapeAll = require("./scrapers"); // Scraper Manager
const { applyFilters } = require("./utils/filter");
const cache = require("./utils/cache");
const { scoreResult, formatStreamName } = require("./utils/quality");

const { unlockRealDebrid } = require("./utils/realdebrid");
const { unlockAllDebrid } = require("./utils/alldebrid");

// MANIFESTO DO ADDON
const manifest = {
  id: "duolite-addon",
  version: "3.0.0",
  name: "Duo Lite",
  description: "Addon estilo Brazuca com múltiplos scrapers + suporte RD/AD",
  logo: "https://i.postimg.cc/KYBymfrP/duolite.png",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],

  config: [
    {
      key: "realdebrid_api",
      type: "text",
      name: "Real-Debrid API Token",
      description: "Cole aqui o token da API Real-Debrid"
    },
    {
      key: "alldebrid_api",
      type: "text",
      name: "AllDebrid API Key",
      description: "Cole aqui sua API Key do AllDebrid"
    }
  ],

  catalogs: []
};

const builder = new addonBuilder(manifest);


// STREAM HANDLER
builder.defineStreamHandler(async ({ type, id, config }) => {
  console.log("Pedido de stream:", { type, id });

  const rdKey = config.realdebrid_api || null;
  const adKey = config.alldebrid_api || null;

  // CACHE
  const cacheKey = `${type}:${id}:${rdKey}:${adKey}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    console.log("CACHE HIT:", cacheKey);
    return { streams: cached };
  }

  console.log("CACHE MISS:", cacheKey);

  // RODAR TODOS SCRAPERS
  let results = await scrapeAll(id);

  // REMOVER DUPLICADOS
  results = applyFilters(results);

  // ORDENAR POR QUALIDADE
  results.sort((a, b) => scoreResult(b) - scoreResult(a));

  // DESBLOQUEAR LINKS SE USUÁRIO TIVER API
  const finalStreams = [];

  for (const r of results) {
    let url = r.url || r.magnet;

    // Real-Debrid
    if (rdKey && url.startsWith("http")) {
      try {
        const unlocked = await unlockRealDebrid(url, rdKey);
        if (unlocked) url = unlocked;
      } catch (e) {
        console.log("Erro RD:", e);
      }
    }

    // AllDebrid
    if (adKey && url.startsWith("http")) {
      try {
        const unlocked = await unlockAllDebrid(url, adKey);
        if (unlocked) url = unlocked;
      } catch (e) {
        console.log("Erro AD:", e);
      }
    }

    finalStreams.push({
      name: formatStreamName(r),
      type: r.magnet ? "torrent" : "url",
      url
    });
  }

  cache.set(cacheKey, finalStreams, 3600); // 1h

  return { streams: finalStreams };
});

// SERVIDOR
const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log("Duo Lite rodando na porta " + PORT);
