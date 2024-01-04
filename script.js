// script.js
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
                    return { server: serverName, ocid: "", info: `정보를 찾을 수 없습니다.` };
                } else {
                    // 에러가 없는 경우
                    const ocid = data.ocid;
                    // 추가 요청을 통해 character/basic의 정보를 가져오기
                    return fetch(`https://open.api.nexon.com/baramy/v1/character/basic?ocid=${ocid}`, {
                        headers: {
                            "x-nxopen-api-key": apiKey
                        }
                    })
                    .then(response => response.json())
                    .then(characterData => {
                        return { server: serverName, ocid, info: characterData };
                    })
                    .catch(error => {
                        console.error(error);
                        return { server: serverName, ocid, info: `Error fetching character/basic: ${error.message}` };
                    });
                }
            })
            .catch(error => {
                console.error(error);
                return { server: serverName, ocid: "", info: `Error: ${error.message}` };
            });
        })
    )
    .then(results => {
        // Display results as a table
        const table = document.createElement("table");
        const headerRow = table.insertRow(0);
        const headers = ["서버", "ocid", "캐릭터 정보"];
        headers.forEach(headerText => {
            const th = document.createElement("th");
            const text = document.createTextNode(headerText);
            th.appendChild(text);
            headerRow.appendChild(th);
        });

        results.forEach(result => {
            const row = table.insertRow();
            const serverCell = row.insertCell(0);
            const ocidCell = row.insertCell(1);
            const infoCell = row.insertCell(2);

            serverCell.appendChild(document.createTextNode(result.server));
            ocidCell.appendChild(document.createTextNode(result.ocid));
            infoCell.appendChild(document.createTextNode(JSON.stringify(result.info)));
        });

        resultDiv.appendChild(table);
    })
    .catch(error => {
        console.error(error);
        resultDiv.textContent = `Error: ${error.message}`;
    });
}
