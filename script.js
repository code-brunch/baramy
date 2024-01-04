document.addEventListener("DOMContentLoaded", async function () {
    // Function to fetch character info for a given server
    const fetchCharacterInfo = async (server) => {
        const characterName = document.getElementById("top-searchbar").value;
        const apiKey = 'test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d';  // Replace with your actual API key
        const apiUrl = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${server}&apikey=${apiKey}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            // Check if the response contains an error
            if (data.error) {
                console.error(`Error fetching data from ${server} - ${data.error.message}`);
                // Return an empty object instead of rejecting the promise
                return {};
            } else {
                console.log(`Character Info from ${server}`, data);
                // Add your logic to display character information in the HTML or do any further processing
                return data;
            }
        } catch (error) {
            console.error(`Error fetching data from ${server} - ${error}`);
            // Return an empty object instead of rejecting the promise
            return {};
        }
    };

    const searchForm = document.getElementById("email-form");

    searchForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];
        const results = await Promise.allSettled(servers.map(server => fetchCharacterInfo(server)));

        // Filter only the fulfilled promises
        const fulfilledResults = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);

        // Process the results to find the highest level character
        const highestLevelCharacter = findHighestLevel(fulfilledResults);
        console.log("Highest Level Character", highestLevelCharacter);
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
