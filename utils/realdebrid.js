const fetch = require("node-fetch");

// DESBLOQUEAR LINK VIA REAL-DEBRID (API OFICIAL)
async function unlockRealDebrid(url, apiKey) {
    try {
        const response = await fetch(
            "https://api.real-debrid.com/rest/1.0/unrestrict/link",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                body: `link=${encodeURIComponent(url)}`
            }
        );

        const data = await response.json();

        // A API retorna algo assim:
        // {
        //   "id": "XYZ",
        //   "filename": "...",
        //   "download": "https://.../file.mp4"
        // }
        if (data && data.download) {
            return data.download;
        }

        return null; // Não desbloqueou ou link inválido

    } catch (err) {
        console.error("Erro RealDebrid:", err);
        return null;
    }
}

module.exports = { unlockRealDebrid };
