function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];

    servers.forEach(serverName => {
        const characterName = encodeURIComponent(document.getElementById("top-searchbar").value);
        const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${serverName}`;

        fetch(url, {
            headers: {
                "x-nxopen-api-key": apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(`Server: ${serverName}`, data);

            const resultDiv = document.getElementById(`${serverName.toLowerCase()}Resp`);

            if (!resultDiv) {
                console.error(`Cannot find element with id ${serverName.toLowerCase()}Resp`);
                return;
            }

            if (data.error) {
                resultDiv.textContent = `Error: ${data.error.message}`;
            } else if (data.ocid) {
                resultDiv.textContent = `ocid(${serverName}): ${data.ocid}`;
            } else {
                resultDiv.textContent = `No data available for ${serverName}`;
            }
        })
        .catch(error => {
            console.error(error);

            const resultDiv = document.getElementById(`${serverName.toLowerCase()}Resp`);
            if (resultDiv) {
                resultDiv.textContent = `Error: ${error.message}`;
            } else {
                console.error(`Cannot find element with id ${serverName.toLowerCase()}Resp`);
            }
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    fetchCharacterInfo();
});
