// script.js
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
        resultDiv.innerHTML = ""; // 기존 내용 초기화

        if (data.error) {
            resultDiv.textContent = `Error: ${data.error.message}`;
        } else {
            // 캐릭터 정보가 있는 경우
            const table = document.createElement("table");
            const tbody = document.createElement("tbody");

            // 기본 정보 표시
            const basicInfo = data.basic_info;
            for (const key in basicInfo) {
                const row = tbody.insertRow();
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);

                cell1.textContent = key;
                cell2.textContent = basicInfo[key];
            }

            // 추가 정보 표시
            if (data.additional_info) {
                const additionalInfo = data.additional_info;
                for (const key in additionalInfo) {
                    const row = tbody.insertRow();
                    const cell1 = row.insertCell(0);
                    const cell2 = row.insertCell(1);

                    cell1.textContent = key;
                    cell2.textContent = additionalInfo[key];
                }
            }
            table.appendChild(tbody);
            resultDiv.appendChild(table);
        }
    })
    .catch(error => {
        console.error(error);
        const resultDiv = document.getElementById("result");
        resultDiv.textContent = `Error: ${error.message}`;
    });
}
