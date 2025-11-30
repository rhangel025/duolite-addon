// Filtro simples: remove duplicados por magnet/url e pode aplicar regras futuramente

function applyFilters(results) {
  const seen = new Set();
  const filtered = [];

  for (const r of results) {
    const key = r.magnet || r.url;
    if (!key) continue;

    if (seen.has(key)) continue;
    seen.add(key);

    filtered.push(r);
  }

  return filtered;
}

module.exports = { applyFilters };
