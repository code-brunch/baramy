const config = {
    apikey: "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d"
};

function fetchServerInfo() {
    const characterName = encodeURIComponent(document.getElementById("characterName").value);
    const url = `https://openapi.nexon.com/game/baramy/?character_name=${characterName}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const resultDiv = document.getElementById("result");
            resultDiv.innerHTML = "<h2>서버 목록</h2>";

            if (data.error) {
                // 에러 메시지가 있는 경우
                console.error(data.error.message);
                resultDiv.textContent = `에러: ${data.error.message}`;
            } else {
                // 정상적인 데이터가 있는 경우
                data.servers.forEach(server => {
                    checkServer(characterName, server.server_id);
                });
            }
        })
        .catch(error => {
            // 네트워크 오류 등의 에러 처리
            console.error(error);
            const resultDiv = document.getElementById("result");
            resultDiv.textContent = `에러: ${error.message}`;
        });
}

function checkServer(characterName, serverId) {
    const url = `https://openapi.nexon.com/heroes/v1/id?character_name=${characterName}&server_id=${serverId}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                const resultDiv = document.getElementById("result");
                resultDiv.innerHTML += `<p>서버: ${serverId}, ocid: ${data.ocid}</p>`;
            }
        })
        .catch(error => {
            // 에러가 있는 경우, 무시하고 다음 서버 확인
        });
}
