const fetch = require("node-fetch");

// DESBLOQUEAR LINK VIA ALLDEBRID (API OFICIAL)
async function unlockAllDebrid(url, apiKey) {
    try {
        const api = `https://api.alldebrid.com/v4/link/unlock?agent=DuoLite&apikey=${apiKey}&link=${encodeURIComponent(
            url
        )}`;

        const res = await fetch(api);
        const json = await res.json();

        // AllDebrid retorna:
        // {
        //   "status": "success",
        //   "data": { "link": "https://..." }
        // }
        if (json && json.status === "success" && json.data && json.data.link) {
            return json.data.link;
        }

        return null;

    } catch (err) {
        console.error("Erro AllDebrid:", err);
        return null;
    }
}

module.exports = { unlockAllDebrid };
