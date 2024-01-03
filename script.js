const config = {
    apikey: "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d"
};

function fetchServerInfo() {
    const characterName = encodeURIComponent(document.getElementById("characterName").value);

    const url = `https://openapi.nexon.com/game/baramy/?character_name=${characterName}`;

    fetch(url, {
        headers: {
            "x-nxopen-api-key": config.apikey
        }
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = "<h2>서버 목록</h2>";

        // 서버 목록을 출력
        data.servers.forEach(server => {
            checkServer(characterName, server.server_id);
        });
    })
    .catch(error => {
        console.error(error);
        const resultDiv = document.getElementById("result");
        resultDiv.textContent = `에러: ${error.message}`;
    });
}

function checkServer(characterName, serverId) {
    const url = `https://openapi.nexon.com/heroes/v1/id?character_name=${characterName}&server_id=${serverId}`;

    fetch(url, {
        headers: {
            "x-nxopen-api-key": config.apikey
        }
    })
    .then(response => response.json())
    .then(data => {
        // 에러가 없는 경우, 결과 출력
        if (!data.error) {
            const resultDiv = document.getElementById("result");
            resultDiv.innerHTML += `<p>서버: ${serverId}, ocid: ${data.ocid}</p>`;
        }
    })
    .catch(error => {
        // 에러가 있는 경우, 무시하고 다음 서버 확인
    });
}
