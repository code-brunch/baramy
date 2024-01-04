function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];
    let highestLevelServer = null;
    let highestLevel = 0;

    const updateHTML = (serverName, data) => {
        const resultDiv = document.getElementById(`${serverName.toLowerCase()}Resp`);

        if (!resultDiv) {
            console.error(`Cannot find element with id ${serverName.toLowerCase()}Resp`);
            return;
        }

        if (data.error) {
            resultDiv.textContent = `Error: ${data.error.message}`;
        } else if (data.ocid) {
            resultDiv.textContent = `ocid(${serverName}): ${data.ocid}`;
            const characterLevel = data.character_level || 0;

            // Update highest level server
            if (characterLevel > highestLevel) {
                highestLevel = characterLevel;
                highestLevelServer = serverName;
            }
        } else {
            resultDiv.textContent = `No data available for ${serverName}`;
        }
    };

    const fetchCharacterDetails = (serverName) => {
        const characterName = encodeURIComponent(document.getElementById("top-searchbar").value);
        const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${serverName}`;

        return fetch(url, {
            headers: {
                "x-nxopen-api-key": apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(`Server: ${serverName}`, data);
            updateHTML(serverName, data);
            return data;
        })
        .catch(error => {
            console.error(error);
            updateHTML(serverName, { error: { message: error.message } });
            return { error: error.message };
        });
    };

    const updateHighestLevelServerHTML = () => {
        if (highestLevelServer) {
            const highestLevelDiv = document.getElementById("serverResp");
            if (highestLevelDiv) {
                highestLevelDiv.textContent = `Highest Level Server: ${highestLevelServer}`;
                // Fetch character details for the highest level server
                fetchCharacterDetails(highestLevelServer);
            } else {
                console.error(`Cannot find element with id serverResp`);
            }
        }
    };

    // Fetch character details for all servers
    const fetchAllCharacterDetails = async () => {
        const detailsPromises = servers.map(serverName => fetchCharacterDetails(serverName));
        const details = await Promise.all(detailsPromises);
        console.log("All character details:", details);
    };

    servers.forEach(serverName => {
        fetchCharacterDetails(serverName);
    });

    // After fetching details for all servers, update highest level server HTML
    fetchAllCharacterDetails().then(updateHighestLevelServerHTML);
}

document.addEventListener("DOMContentLoaded", function () {
    fetchCharacterInfo();
});
