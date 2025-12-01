const manifest = {
  id: "duolite-addon",
  version: "3.0.0",
  name: "Duo Lite",
  description: "Addon estilo Brazuca com múltiplos scrapers e suporte a RD/AD.",
  logo: "https://i.imgur.com/TX1n3tI.png",

  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],

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
      description: "Ajustes opcionais para usuários avançados."
    },
    {
      key: "enable_logs",
      type: "checkbox",
      name: "Ativar logs",
      description: "Exibe logs dos scrapers no Render."
    },
    {
      key: "timeout",
      type: "number",
      name: "Tempo limite (ms)",
      description: "Tempo máximo para cada scraper."
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
