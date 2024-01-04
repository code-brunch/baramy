// Function to fetch character info for a given server
const fetchCharacterInfo = async (server) => {
    const characterInput = document.getElementById("characterName");
    const serverInput = document.getElementById("serverName");

    // Check if the required inputs are available
    if (!characterInput || !serverInput) {
        console.error("Required inputs not found.");
        return;
    }

    const characterName = encodeURIComponent(characterInput.value);
    const apiKey = 'test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d';
    const apiUrl = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${server}&apikey=${apiKey}`;

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
