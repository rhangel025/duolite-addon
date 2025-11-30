// Scraper DEMO Vacatorrent
// Também é exemplo: devolve um link de URL direto pra streaming de teste.

async function searchVacatorrent({ type, id }) {
  if (type === "movie" && id === "tt1254207") {
    return [
      {
        source: "Vacatorrent (Demo)",
        url: "http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4"
      }
    ];
  }

  return [];
}

module.exports = { searchVacatorrent };
