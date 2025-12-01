const fs = require("fs");
const path = require("path");

// Função que aplica timeout a qualquer Promise
function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), ms)
        )
    ]);
}

// Carrega automaticamente todos os scrapers .js dentro da pasta scrapers
function loadScrapers() {
    const scrapers = [];
    const files = fs.readdirSync(__dirname);

    for (const file of files) {
        if (file === "index.js") continue;
        if (!file.endsWith(".js")) continue;

        try {
            const mod = require(path.join(__dirname, file));

            if (typeof mod.scrape === "function") {
                scrapers.push({
                    name: file.replace(".js", ""),
                    fn: mod.scrape
                });
            } else {
                console.log(`Ignorando ${file}: não possui scrape()`);
            }
        } catch (err) {
            console.log(`Erro ao carregar scraper ${file}:`, err);
        }
    }

    return scrapers;
}

/**
 * Executa todos os scrapers
 *
 * @param {string} query id/título do filme/serie
 * @param {number} timeoutMs tempo limite por scraper
 * @param {boolean} logs mostrar logs ou não
 */
async function scrapeAll(query, timeoutMs = 8000, logs = false) {
    const scrapers = loadScrapers();
    const tasks = [];

    if (logs) {
        console.log("📌 Scrapers carregados:", scrapers.map(s => s.name).join(", "));
        console.log("⏱ Timeout:", timeoutMs, "ms");
    }

    for (const scr of scrapers) {
        const task = withTimeout(
            scr.fn(query).catch(err => {
                if (logs) console.log(`❌ Erro no scraper ${scr.name}:`, err);
                return [];
            }),
            timeoutMs
        ).catch(() => {
            if (logs) console.log(`⏳ Timeout no scraper ${scr.name}`);
            return [];
        });

        tasks.push(task);
    }

    const results = await Promise.all(tasks);
    const finalResults = results.flat();

    if (logs) {
        console.log("📦 Total de resultados:", finalResults.length);
    }

    return finalResults;
}

module.exports = scrapeAll;
