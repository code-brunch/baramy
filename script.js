const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];

function fetchCharacterInfo() {
    // Check if the required inputs are available
    const characterInput = document.getElementById("characterName");
    const serverInput = document.getElementById("serverName");

    if (!characterInput || !serverInput) {
        console.error("Required inputs not found.");
    } else {
        const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
        const characterName = encodeURIComponent(characterInput.value);
        const serverName = encodeURIComponent(serverInput.value);

        // Array to store promises for each server
        const serverPromises = [];

        // Iterate over each server
        servers.forEach(server => {
            // Create a promise for each server
            const serverPromise = fetchServerInfo(apiKey, characterName, server);
            serverPromises.push(serverPromise);
        });

        // Wait for all promises to resolve
        Promise.all(serverPromises)
            .then(results => {
                // Find and display the highest level character across all servers
                findHighestLevelAcrossServers(results);
            })
            .catch(error => {
                console.error(error);
                const resultDiv = document.getElementById("result");
                resultDiv.textContent = `Error: ${error.message}`;
            });
    }
}

function fetchServerInfo(apiKey, characterName, serverName) {
    // Create a promise for fetching server information
    return new Promise((resolve, reject) => {
        const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${serverName}&apikey=${apiKey}`;

        fetch(url, {
            headers: {
                "x-nxopen-api-key": apiKey
            }
        })
            .then(response => response.json())
            .then(data => {
                resolve(data);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function findHighestLevelAcrossServers(serverResults) {
    // Flatten the array of character objects from all servers
    const allCharacters = serverResults.flatMap(serverResult => serverResult.characters);

    if (!allCharacters || allCharacters.length === 0) {
        console.error("No characters found.");
        return;
    }

    // Find the character with the highest level
    const highestLevelCharacter = allCharacters.reduce((highest, current) => {
        return current.level > highest.level ? current : highest;
    });

    // Display the highest level character information
    const highestLevelDiv = document.getElementById("highestLevel");
    highestLevelDiv.textContent = `Highest Level: ${highestLevelCharacter.name} (Level ${highestLevelCharacter.level})`;
}
