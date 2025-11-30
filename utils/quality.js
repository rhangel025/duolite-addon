function getQualityRank(q) {
  if (!q) return 0;
  q = q.toLowerCase();

  if (q.includes("2160") || q.includes("4k")) return 4;
  if (q.includes("1080")) return 3;
  if (q.includes("720")) return 2;
  if (q.includes("480") || q.includes("sd")) return 1;

  return 1;
}

function formatSize(sizeMB) {
  if (!sizeMB) return null;

  if (sizeMB >= 1024) return (sizeMB / 1024).toFixed(1) + " GB";
  return sizeMB + " MB";
}

function scoreResult(r) {
  const q = getQualityRank(r.quality);
  const s = r.seeds || 0;
  return q * 1000 + s;
}

function formatStreamName(r) {
  let name = `Duo Lite • ${r.source || "Fonte"}`;

  if (r.quality) name += ` • ${r.quality}`;
  if (r.sizeMB) name += ` • ${formatSize(r.sizeMB)}`;
  if (r.seeds) name += ` • ${r.seeds} seeds`;

  return name;
}

module.exports = { scoreResult, formatStreamName };
