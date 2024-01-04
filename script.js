function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];

    const serverLevels = {};

    const promises = servers.map(serverName => {
        const characterName = encodeURIComponent(document.getElementById("top-searchbar").value);
        const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${serverName}`;
        
        console.log("Requesting data from:", serverName, "URL:", url); // 추가된 로그

        return new Promise((resolve, reject) => {
            fetch(url, {
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error && data.character_level) {
                    serverLevels[serverName] = data.character_level;
                }
                resolve();
            })
            .catch(error => {
                console.error(`Error fetching data from ${serverName}:`, error);
                reject();
            });
        });
    });

    Promise.all(promises)
        .then(() => {
            const highestLevelServer = Object.keys(serverLevels).reduce((a, b) => serverLevels[a] > serverLevels[b] ? a : b);

            if (highestLevelServer) {
                console.log(`Fetching data from the highest level server (${highestLevelServer})`);
                const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${encodeURIComponent(document.getElementById("top-searchbar").value)}&server_name=${highestLevelServer}`;
                
                fetch(url, {
                    headers: {
                        "x-nxopen-api-key": apiKey
                    }
                })
                .then(response => response.json())
                .then(data => {
                    console.log(`Server: ${highestLevelServer}`, data);
                })
                .catch(error => {
                    console.error(`Error fetching data from ${highestLevelServer}:`, error);
                });
            } else {
                console.error("No server data available.");
            }
        })
        .catch(() => {
            console.error("Error fetching data from one or more servers.");
        });
}

document.addEventListener("DOMContentLoaded", function () {
    fetchCharacterInfo();
});
