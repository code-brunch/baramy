function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];

    const requests = servers.map(serverName => {
        const characterName = encodeURIComponent(document.getElementById("top-searchbar").value);
        const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${serverName}`;

        return fetch(url, {
            headers: {
                "x-nxopen-api-key": apiKey
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(`Requesting data from: ${serverName} URL: ${url}`, data);

            const resultDiv = document.getElementById(`${serverName.toLowerCase()}Resp`);

            if (!resultDiv) {
                console.error(`Cannot find element with id ${serverName.toLowerCase()}Resp`);
                return;
            }

            if (data.error) {
                resultDiv.textContent = `Error(${serverName}): ${data.error.message}`;
            } else if (data.ocid) {
                resultDiv.textContent = `ocid(${serverName}): ${data.ocid}`;
            } else {
                resultDiv.textContent = `No data available for ${serverName}`;
            }
        })
        .catch(error => {
            console.error(`Error fetching data from ${serverName}:`, error);

            const resultDiv = document.getElementById(`${serverName.toLowerCase()}Resp`);
            if (resultDiv) {
                resultDiv.textContent = `Error(${serverName}): ${error.message}`;
            } else {
                console.error(`Cannot find element with id ${serverName.toLowerCase()}Resp`);
            }
        });
    });

    Promise.all(requests)
        .then(() => {
            // 여기서 모든 요청이 완료된 후의 작업을 수행할 수 있습니다.
            console.log("All requests completed.");
        })
        .catch(allError => {
            // 여기서 모든 요청 중 하나라도 실패했을 때의 작업을 수행할 수 있습니다.
            console.error("Error fetching data from one or more servers.", allError);
        });
}

document.addEventListener("DOMContentLoaded", function () {
    const searchForm = document.getElementById("email-form");

    searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        fetchCharacterInfo();
    });
});
