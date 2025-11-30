// utils/quality.js
// Funções para lidar com qualidade, tamanho, seeds e score dos resultados.

// Converte "1080p", "720p", etc. em um número de rank
function getQualityRank(quality) {
  if (!quality) return 0;
  const q = quality.toString().toLowerCase();

  if (q.includes("2160") || q.includes("4k")) return 4;
  if (q.includes("1440")) return 3;
  if (q.includes("1080")) return 3;
  if (q.includes("720")) return 2;
  if (q.includes("480") || q.includes("sd")) return 1;

  return 1; // padrão
}

// Formata tamanho em MB para string bonitinha
function formatSize(sizeMB) {
  if (!sizeMB || isNaN(sizeMB)) return null;

  if (sizeMB >= 1024) {
    const sizeGB = sizeMB / 1024;
    return `${sizeGB.toFixed(1)} GB`;
  }

  return `${sizeMB.toFixed(0)} MB`;
}

// Calcula um score para ordenar os resultados
function scoreResult(result) {
  const qualityRank = getQualityRank(result.quality);
  const seeds = typeof result.seeds === "number" ? result.seeds : 0;

  // Score simples: qualidade pesa mais, seeds ajudam
  return qualityRank * 1000 + seeds;
}

// Monta o nome que aparece no Stremio
function formatStreamName(result) {
  const source = result.source || "Fonte";
  const quality = result.quality || "HD";
  const sizeFormatted = formatSize(result.sizeMB);
  const seeds = typeof result.seeds === "number" ? result.seeds : null;

  let parts = [`Duo Lite • ${source}`, quality];

  if (sizeFormatted) {
    parts.push(sizeFormatted);
  }

  if (seeds !== null) {
    parts.push(`${seeds} seeds`);
  }

  return parts.join(" • ");
}

module.exports = {
  scoreResult,
  formatStreamName
};
