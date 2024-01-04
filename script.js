function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];

    // 객체를 사용하여 서버별 레벨을 저장할 변수
    const serverLevels = {};

    const promises = servers.map(serverName => {
        const characterName = encodeURIComponent(document.getElementById("top-searchbar").value);
        const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${serverName}`;

        // 각 서버에 대한 fetch 호출을 promise로 감싸서 배열로 만듦
        return new Promise((resolve, reject) => {
            fetch(url, {
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            })
            .then(response => response.json())
            .then(data => {
                if (!data.error && data.character_level) {
                    // 서버 레벨 저장
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

    // 모든 promise들이 해결(resolve)될 때 실행될 코드
    Promise.all(promises)
        .then(() => {
            // serverLevels 객체에서 가장 높은 레벨을 가진 서버를 찾음
            const highestLevelServer = Object.keys(serverLevels).reduce((a, b) => serverLevels[a] > serverLevels[b] ? a : b);

            // 가장 높은 레벨을 가진 서버로 다시 fetch하여 정보를 가져옴
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
                    // TODO: 여기에서 HTML 업데이트 등을 수행
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
