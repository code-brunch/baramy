const config = {
    apikey: "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d"
};

function fetchServerInfo() {
    const characterName = encodeURIComponent(document.getElementById("characterName").value);
    const url = `https://openapi.nexon.com/game/baramy/?character_name=${characterName}`;

    fetch(url)
        .then(response => {
            // 응답이 성공인지 확인
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            // JSON 형식으로 파싱
            return response.json();
        })
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
            console.error(error.message);
            const resultDiv = document.getElementById("result");
            resultDiv.textContent = `에러: ${error.message}`;
        });
}
