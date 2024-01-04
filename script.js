function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const characterName = encodeURIComponent(document.getElementById("characterName").value);
    const serverName = encodeURIComponent(document.getElementById("serverName").value);

    const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${serverName}`;

    fetch(url, {
        headers: {
            "x-nxopen-api-key": apiKey
        }
    })
    .then(response => response.json())
    .then(data => {
        const resultDiv = document.getElementById("result");

        if (data.error) {
            // 에러가 있는 경우
            resultDiv.textContent = `정보를 찾을 수 없습니다.`;
        } else {
            // 에러가 없는 경우
            resultDiv.textContent = `ocid: ${data.ocid}`;
        }
    })
    .catch(error => {
        console.error(error);
        const resultDiv = document.getElementById("result");
        resultDiv.textContent = `Error: ${error.message}`;
    });
}
