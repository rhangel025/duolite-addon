const fetch = require("node-fetch");

// DESBLOQUEAR LINK VIA REAL-DEBRID (OFICIAL)
async function unlockRealDebrid(url, apiKey) {
    const res = await fetch("https://api.real-debrid.com/rest/1.0/unrestrict/link", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `link=${encodeURIComponent(url)}`
    });

    const data = await res.json();

    if (data && data.download) {
        return data.download; // link desbloqueado
    }

    return null;
}

module.exports = { unlockRealDebrid };
