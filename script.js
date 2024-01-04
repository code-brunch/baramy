function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const characterName = encodeURIComponent(document.getElementById("characterName").value);

    const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = ""; // Clear previous results

    // Use Promise.all to handle multiple asynchronous requests
    Promise.all(
        servers.map(serverName => {
            const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${encodeURIComponent(serverName)}`;

            return fetch(url, {
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    // 에러가 있는 경우
                    return `서버: ${serverName}, 정보를 찾을 수 없습니다.`;
                } else {
                    // 에러가 없는 경우
                    return `서버: ${serverName}, ocid: ${data.ocid}`;
                }
            })
            .catch(error => {
                console.error(error);
                return `서버: ${serverName}, Error: ${error.message}`;
            });
        })
    )
    .then(results => {
        // Display results
        resultDiv.innerHTML = results.join("<br>");
    })
    .catch(error => {
        console.error(error);
        resultDiv.textContent = `Error: ${error.message}`;
    });
}
