const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const scrapeAll = require("./scrapers");
const { applyFilters } = require("./utils/filter");
const cache = require("./utils/cache");
const { scoreResult, formatStreamName } = require("./utils/quality");

const { unlockRealDebrid } = require("./utils/realdebrid");
const { unlockAllDebrid } = require("./utils/alldebrid");

const manifest = {
  id: "duolite-addon",
  version: "3.0.0",
  name: "Duo Lite",
  description: "Addon estilo Brazuca com múltiplos scrapers + suporte RD/AD",
  logo: "https://i.postimg.cc/KYBymfrP/duolite.png",

  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],

  // CAMPOS DE CONFIGURAÇÃO (CORRETO)
  config: [
    {
      key: "realdebrid_api",
      type: "text",
      name: "Real-Debrid API Token",
      description: "Cole aqui seu token da API Real-Debrid"
    },
    {
      key: "alldebrid_api",
      type: "text",
      name: "AllDebrid API Key",
      description: "Cole aqui sua chave da API AllDebrid"
    }
  ],

  catalogs: []
};

const builder = new addonBuilder(manifest);

builder.defineStreamHandler(async ({ type, id, config }) => {

  console.log("Recebido:", { type, id });

  const rdKey = config.realdebrid_api || null;
  const adKey = config.alldebrid_api || null;

  // CACHE
  const cacheKey = `${type}:${id}:${rdKey}:${adKey}`;
  const cached = cache.get(cacheKey);
  if (cached) return { streams: cached };

  // RODAR SCRAPERS
  let results = await scrapeAll(id);

  results = applyFilters(results);
  results.sort((a, b) => scoreResult(b) - scoreResult(a));

  const final = [];

  for (let r of results) {
    let url = r.url || r.magnet;

    if (rdKey && url.startsWith("http")) {
      try {
        const unlock = await unlockRealDebrid(url, rdKey);
        if (unlock) url = unlock;
      } catch (e) {}
    }

    if (adKey && url.startsWith("http")) {
      try {
        const unlock = await unlockAllDebrid(url, adKey);
        if (unlock) url = unlock;
      } catch (e) {}
    }

    final.push({
      name: formatStreamName(r),
      type: r.magnet ? "torrent" : "url",
      url
    });
  }

  cache.set(cacheKey, final, 3600);

  return { streams: final };
});

serveHTTP(builder.getInterface(), { port: process.env.PORT || 7000 });

console.log("Duo Lite rodando…");
