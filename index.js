const express = require("express");
const cors = require("cors");
const { addonBuilder } = require("stremio-addon-sdk");

// SCRAPER MANAGER
const { runAllScrapers } = require("./scrapers/index");

// SERVER
const app = express();
app.use(cors());

// =============================
// MANIFEST CORRIGIDO FINAL
// =============================
const manifest = {
  id: "duolite-addon",
  version: "3.0.0",
  name: "Duo Lite",
  description: "Addon com múltiplos servidores e suporte RD/AD.",
  logo: "https://i.imgur.com/TX1n3tI.png",

  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],

  behaviorHints: {
    configurable: true
  },

  config: [
    // ================== REAL DEBRID ==================
    {
      key: "rd_title",
      type: "info",
      name: "Real Debrid",
      description: "Opcional: use o token da API do Real Debrid."
    },
    {
      key: "realdebrid_api",
      type: "text",
      name: "Token do Real Debrid",
      description: "Cole aqui seu token (opcional)."
    },

    // ================== ALLDEBRID ==================
    {
      key: "ad_title",
      type: "info",
      name: "AllDebrid",
      description: "Opcional: use a API Key do AllDebrid."
    },
    {
      key: "alldebrid_api",
      type: "text",
      name: "API Key do AllDebrid",
      description: "Cole aqui sua API Key (opcional)."
    },

    // ================== AVANÇADOS ==================
    {
      key: "adv_title",
      type: "info",
      name: "Configurações avançadas",
      description: "Ajustes extras para scrapers."
    },
    {
      key: "enable_logs",
      type: "checkbox",
      name: "Ativar logs (Render)",
      description: "Mostra logs no console."
    },
    {
      key: "timeout",
      type: "number",
      name: "Tempo máximo por scraper (ms)",
      description: "Padrão: 8000ms",
      default: 8000
    },

    // ================== NOTA FINAL ==================
    {
      key: "final_tip",
      type: "info",
      name: "Observação",
      description: "O addon funciona mesmo sem RD/AD."
    }
  ],

  catalogs: []
};

// =============================
// ADDON BUILDER
// =============================
const builder = new addonBuilder(manifest);

// =============================
// STREAM HANDLER
// =============================
builder.defineStreamHandler(async ({ id }, config) => {
  try {
    const query = id;

    const timeout = Number(config.timeout) || 8000;
    const enableLogs = config.enable_logs || false;

    const rd_key = config.realdebrid_api || null;
    const ad_key = config.alldebrid_api || null;

    if (enableLogs) {
      console.log("📌 Rodando scrapers para:", query);
      console.log("⚙ Timeout:", timeout);
      console.log("🔑 RealDebrid:", rd_key ? "SIM" : "NÃO");
      console.log("🔑 AllDebrid:", ad_key ? "SIM" : "NÃO");
    }

    // Chama o scraper manager
    const streams = await runAllScrapers(query, {
      timeout,
      rd_key,
      ad_key,
      enableLogs
    });

    return { streams };

  } catch (error) {
    console.error("❌ Erro no stream handler:", error);
    return { streams: [] };
  }
});

// =============================
// START SERVER
// =============================
const addonInterface = builder.getInterface();
app.use("/", addonInterface);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🔥 Duo Lite rodando na porta ${PORT}`);
  console.log(`📄 Manifesto: http://localhost:${PORT}/manifest.json`);
});
