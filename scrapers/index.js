const fs = require("fs");
const path = require("path");

// Tempo máximo por scraper (ms)
const SCRAPER_TIMEOUT = 8000;

// Função de timeout
function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), ms)
        )
    ]);
}

// Carrega automaticamente todos os scrapers
function loadScrapers() {
    const scrapers = [];
    const files = fs.readdirSync(__dirname);

    for (const file of files) {
        if (file === "index.js") continue;
        if (!file.endsWith(".js")) continue;

        try {
            const scraper = require(path.join(__dirname, file));

            if (typeof scraper.scrape !== "function") {
                console.log("Ignorando scraper sem função scrape():", file);
                continue;
            }

            scrapers.push({
                name: file.replace(".js", ""),
                fn: scraper.scrape
            });

        } catch (err) {
            console.error("Erro ao carregar scraper:", file, err);
        }
    }

    return scrapers;
}

// Roda todos os scrapers em paralelo
async function scrapeAll(query) {
    const scrapers = loadScrapers();
    const tasks = [];

    console.log("Scrapers carregados:", scrapers.map(s => s.name).join(", "));

    for (const scr of scrapers) {
        const task = withTimeout(
            scr.fn(query).catch(err => {
                console.error(`Erro no scraper ${scr.name}:`, err);
                return [];
            }),
            SCRAPER_TIMEOUT
        ).catch(() => {
            console.error(`Timeout no scraper ${scr.name}`);
            return [];
        });

        tasks.push(task);
    }

    const results = await Promise.all(tasks);
    return results.flat();
}

module.exports = scrapeAll;
