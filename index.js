const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const scrapeAll = require("./scrapers");
const cache = require("./utils/cache");
const { applyFilters } = require("./utils/filter");
const { scoreResult, formatStreamName } = require("./utils/quality");

const { unlockRealDebrid } = require("./utils/realdebrid");
const { unlockAllDebrid } = require("./utils/alldebrid");

// -----------------------------------------------------
// MANIFESTO COMPLETO (CONFIGURAÇÕES BONITAS)
// -----------------------------------------------------

const manifest = {
  id: "duolite-addon",
  version: "3.0.0",
  name: "Duo Lite",
  description: "Addon estilo Brazuca com múltiplos scrapers + suporte RD/AD",
  logo: "https://i.imgur.com/TX1n3tI.png",

  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],

  config: [
    // REAL-DEBRID
    {
      key: "rd_title",
      type: "info",
      name: "⭐ Real-Debrid",
      description: "Serviço premium para desbloquear links, acelerar buffer e aumentar qualidade."
    },
    {
      key: "realdebrid_api",
      type: "text",
      name: "🔑 Real-Debrid API Token",
      description: "Cole aqui seu TOKEN da API (Menu > My Account > API Token).",
      placeholder: "ex: eyJhbGciOiJIUzI1NiIsInR5cCI..."
    },

    // ALLDEBRID
    {
      key: "ad_title",
      type: "info",
      name: "⭐ AllDebrid",
      description: "Alternativa moderna ao Real-Debrid, com desbloqueio rápido."
    },
    {
      key: "alldebrid_api",
      type: "text",
      name: "🔑 AllDebrid API Key",
      description: "Cole aqui sua API Key (Menu > My Account > API).",
      placeholder: "ex: 93b48d92e4bf1"
    },

    // CONFIGURAÇÕES AVANÇADAS
    {
      key: "adv_title",
      type: "info",
      name: "🛠 Configurações Avançadas",
      description: "Opções extras para usuários experientes."
    },
    {
      key: "enable_logs",
      type: "checkbox",
      name: "📜 Ativar logs detalhados",
      description: "Exibe logs dos scrapers no Render.",
      default: false
    },
    {
      key: "timeout",
      type: "number",
      name: "⏱ Tempo limite do scraper (ms)",
      description: "Padrão: 8000 ms. Reduza para respostas mais rápidas.",
      default: 8000
    },

    // OBSERVAÇÃO FINAL
    {
      key: "final_tip",
      type: "info",
      name: "ℹ️ Observação",
      description: "O addon funciona normalmente sem RD/AD. Use apenas se tiver assinatura."
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

  if (logs) console.log("📥 Pedido:", { type, id });

  // CACHE
  const cacheKey = `${type}:${id}:${rdKey}:${adKey}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    if (logs) console.log("⚡ CACHE HIT:", cacheKey);
    return { streams: cached };
  }

  if (logs) console.log("⏳ Rodando scrapers… Timeout:", timeout);

  // RODAR SCRAPERS
  let results = await scrapeAll(id, timeout);

  results = applyFilters(results);
  results.sort((a, b) => scoreResult(b) - scoreResult(a));

  const finalStreams = [];

  // DESBLOQUEIO RD/AD
  for (let r of results) {
    let url = r.url || r.magnet;

    if (rdKey && url.startsWith("http")) {
      try {
        const unlocked = await unlockRealDebrid(url, rdKey);
        if (unlocked) {
          if (logs) console.log("🔓 RealDebrid desbloqueou:", unlocked);
          url = unlocked;
        }
      } catch (e) {
        if (logs) console.log("Erro RD:", e);
      }
    }

    if (adKey && url.startsWith("http")) {
      try {
        const unlocked = await unlockAllDebrid(url, adKey);
        if (unlocked) {
          if (logs) console.log("🔓 AllDebrid desbloqueou:", unlocked);
          url = unlocked;
        }
      } catch (e) {
        if (logs) console.log("Erro AD:", e);
      }
    }

    finalStreams.push({
      name: formatStreamName(r),
      type: r.magnet ? "torrent" : "url",
      url
    });
  }

  cache.set(cacheKey, finalStreams, 3600); // 1 hora

  if (logs) console.log("📤 Streams entregues:", finalStreams.length);

  return { streams: finalStreams };
});

// -----------------------------------------------------
// INICIAR SERVIDOR
// -----------------------------------------------------

const PORT = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: PORT });

console.log(`🔥 Duo Lite rodando na porta ${PORT}`);
