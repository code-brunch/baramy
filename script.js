document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("email-form");

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();
        
        const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];

        // Function to fetch character info for a given server
        const fetchCharacterInfo = async (server) => {
            const characterName = document.getElementById("top-searchbar").value;
            const apiUrl = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${server}`;

            try {
                const response = await fetch(apiUrl);
                const data = await response.json();

                // Check if the response contains an error
                if (data.error) {
                    console.error(`Error fetching data from ${server} - ${data.error.message}`);
                } else {
                    console.log(`Character Info from ${server}`, data);
                    // Add your logic to display character information in the HTML or do any further processing
                }
            } catch (error) {
                console.error(`Error fetching data from ${server} - ${error}`);
            }
        };

        // Array to store promises for each server request
        const requests = servers.map(server => fetchCharacterInfo(server));

        // Promise.all() waits for all requests to complete
        Promise.all(requests)
            .then(results => {
                // Process the results to find the highest level character
                const highestLevelCharacter = findHighestLevel(results);
                console.log("Highest Level Character", highestLevelCharacter);
            })
            .catch(error => console.error("Error fetching data from one or more servers.", error));
    });

    // Function to find the highest level character
    const findHighestLevel = (characterDataArray) => {
        let highestLevel = -1;
        let highestLevelCharacter = null;

        characterDataArray.forEach(characterData => {
            if (characterData.level && characterData.level > highestLevel) {
                highestLevel = characterData.level;
                highestLevelCharacter = characterData;
            }
        });

        return highestLevelCharacter;
    };
});
