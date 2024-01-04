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

        if (data.error) {
            // 에러가 있는 경우
            resultDiv.textContent = `정보를 찾을 수 없습니다.`;
        } else {
            // 에러가 없는 경우
            const ocid = data.ocid;

            // 추가 정보를 받아오는 URL
            const additionalInfoUrl = `https://open.api.nexon.com/baramy/v1/character/basic?ocid=${ocid}`;

            // 추가 정보 요청
            fetch(additionalInfoUrl, {
                headers: {
                    "x-nxopen-api-key": apiKey
                }
            })
            .then(response => response.json())
            .then(additionalInfo => {
                // 추가 정보를 출력
                resultDiv.textContent = `ocid: ${ocid}\n\n` +
                                        `서버: ${additionalInfo.server_name}\n` +
                                        `캐릭터 명: ${additionalInfo.character_name}\n` +
                                        `캐릭터 생성 일자: ${additionalInfo.character_date_create}\n` +
                                        `클래스 그룹: ${additionalInfo.character_class_group_name}\n` +
                                        `클래스: ${additionalInfo.character_class_name}\n` +
                                        `국가: ${additionalInfo.character_nation}\n` +
                                        `성별: ${additionalInfo.character_gender}\n` +
                                        `경험치: ${additionalInfo.character_exp}\n` +
                                        `레벨: ${additionalInfo.character_level}`;
            })
            .catch(error => {
                console.error(error);
                resultDiv.textContent = `에러: ${error.message}`;
            });
        }
    })
    .catch(error => {
        console.error(error);
        const resultDiv = document.getElementById("result");
        resultDiv.textContent = `에러: ${error.message}`;
    });
}
