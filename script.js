// script.js
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

        const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${serverName}&apikey=${apiKey}`;

        fetch(url, {
            headers: {
                "x-nxopen-api-key": apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById("result");

            if (data.error) {
                resultDiv.textContent = `Error: ${data.error}`;
            } else {
                resultDiv.textContent = `ocid: ${data.ocid}`;
            }
        })
        .catch(error => {
            console.error(error);
            const resultDiv = document.getElementById("result");
            resultDiv.textContent = `Error: ${error.message}`;
        });
    }
}
