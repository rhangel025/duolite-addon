const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

// Manifesto do addon (como se fosse o "cartão de visita" dele)
const manifest = {
  id: "duolite-addon",
  version: "1.0.0",
  name: "Duo Lite (Demo)",
  description: "Addon de exemplo para Stremio, pronto para ser estendido depois",
  logo: "https://i.imgur.com/TX1n3tI.png",
  resources: ["stream"],
  types: ["movie", "series"],
  idPrefixes: ["tt"],
  catalogs: []
};

// Cria o builder com o manifesto
const builder = new addonBuilder(manifest);

// Handler de streams (onde você devolve os links pro Stremio)
builder.defineStreamHandler((args) => {
  const { type, id } = args;

  console.log("Pedido de stream:", args);

  // Exemplo: só responde quando for um filme com esse ID específico
  // (tt1254207 = Big Buck Bunny | é só pra testar)
  if (type === "movie" && id === "tt1254207") {
    const streams = [
      {
        name: "Duo Lite • Demo 1080p",
        type: "url",
        url: "http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4"
      }
    ];

    return Promise.resolve({ streams });
  }

  // Para qualquer outro item, não retorna nada (vazio)
  return Promise.resolve({ streams: [] });
});

// Sobe o servidor HTTP do addon
const PORT = process.env.PORT || 7000;

serveHTTP(builder.getInterface(), { port: PORT });

console.log(`Duo Lite addon rodando na porta ${PORT}`);
console.log("Quando estiver no Render, use: https://SEU-DOMINIO.onrender.com/manifest.json no Stremio");
