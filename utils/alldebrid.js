const fetch = require("node-fetch");

// DESBLOQUEAR LINK VIA ALLDEBRID (OFICIAL)
async function unlockAllDebrid(url, apiKey) {
    const api = `https://api.alldebrid.com/v4/link/unlock?agent=DuoLite&apikey=${apiKey}&link=${encodeURIComponent(url)}`;

    const res = await fetch(api);
    const json = await res.json();

    if (json && json.data && json.data.link) {
        return json.data.link; // link desbloqueado
    }

    return null;
}

module.exports = { unlockAllDebrid };
