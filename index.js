const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const scrapeAll = require("./scrapers");
const cache = require("./utils/cache");
const { applyFilters } = require("./utils/filter");
const { scoreResult, formatStreamName } = require("./utils/quality");
const { unlockRealDebrid } = require("./utils/realdebrid");
const { unlockAllDebrid } = require("./utils/alldebrid");

// -----------------------------------------------------
// MANIFESTO FINAL (com botão de CONFIGURAR ativado)
// -----------------------------------------------------
const manifest = {
  id: "duolite-addon",
  version: "3.0.0",
  name: "Duo Lite",
  description: "Addon estilo Brazuca com múltiplos scrapers e suporte RD/AD.",
  logo: "https://i.imgur.com/TX1n3tI.png",

  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],

  // ATIVA O BOTÃO CONFIGURAR NO STREMIO
  behaviorHints: {
    configurable: true
  },

  // CONFIGURAÇÕES VISÍVEIS NO STREMIO
  config: [
    {
      key: "rd_title",
      type: "info",
      name: "Real-Debrid",
      description: "Desbloqueie links usando sua API RD."
    },
    {
      key: "realdebrid_api",
      type: "text",
      name: "API Token do Real-Debrid",
      description: "Cole aqui seu token da API RD."
    },

    {
      key: "ad_title",
      type: "info",
      name: "AllDebrid",
      description: "Integre sua conta AllDebrid ao addon."
    },
    {
      key: "alldebrid_api",
      type: "text",
      name: "API Key do AllDebrid",
      description: "Cole sua chave da API."
    },

    {
      key: "adv_title",
      type: "info",
      name: "Configurações Avançadas",
      description: "Ajustes opcionais para usuários experientes."
    },
    {
      key: "enable_logs",
      type: "checkbox",
      name: "Ativar logs",
      description: "Exibe logs detalhados no Render."
    },
    {
      key: "timeout",
      type: "number",
      name: "Tempo limite (ms)",
      description: "Tempo máximo para cada scraper (padrão 8000)."
    },

    {
      key: "final_tip",
      type: "info",
      name: "Observação",
      description: "O addon funciona mesmo sem RD/AD."
    }
  ],

  catalogs: []
};

const builder = new addonBuilder(manifest);

// -----------------------------------------------------
// STREAM HANDLER
// -----------------------------------------------------
builder.defineStreamHandler(async ({ type, id, config }) => {
  const logs = config.enable_logs ?? false;
  const timeout = Number(config.timeout) || 8000;

  const rdKey = config.realdebrid_api || null;
  const adKey = config.alldebrid_api || null;

  if (logs) console.log("📥 Pedido recebido:", { type, id });

  // CACHE
  const cacheKey = `${type}:${id}:${rdKey}:${adKey}:${timeout}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    if (logs) console.log("⚡ Cache HIT:", cacheKey);
    return { streams: cached };
  }

  if (logs) console.log(`⏳ Rodando scrapers (timeout ${timeout}ms)...`);

  // RODAR SCRAPERS
  let results = await scrapeAll(id, timeout, logs);

  // FILTRAR + ORDENAR
  results = applyFilters(results);
  results.sort((a, b) => scoreResult(b) - scoreResult(a));

  const finalStreams = [];

  for (const r of results) {
    let url = r.url || r.magnet;

    // RD
    if (rdKey && url && url.startsWith("http")) {
      try {
        const unlocked = await unlockRealDebrid(url, rdKey);
        if (unlocked) {
          if (logs) console.log("🔓 RealDebrid:", unlocked);
          url = unlocked;
        }
      } catch (e) {
        if (logs) console.log("Erro RD:", e.message || e);
      }
    }

    // AD
    if (adKey && url && url.startsWith("http")) {
      try {
        const unlocked = await unlockAllDebrid(url, adKey);
        if (unlocked) {
          if (logs) console.log("🔓 AllDebrid:", unlocked);
          url = unlocked;
        }
      } catch (e) {
        if (logs) console.log("Erro AD:", e.message || e);
      }
    }

    finalStreams.push({
      name: formatStreamName(r),
      type: r.magnet ? "torrent" : "url",
      url
    });
  }

  cache.set(cacheKey, finalStreams, 3600); // 1 hora

  if (logs) console.log("📤 Streams enviadas:", finalStreams.length);

  return { streams: finalStreams };
});

// -----------------------------------------------------
// INICIAR SERVIDOR HTTP
// -----------------------------------------------------
const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log(`🔥 Duo Lite rodando na porta ${PORT}`);
