function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const characterName = encodeURIComponent(document.getElementById("characterName").value);

    const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = ""; // Clear previous results

    let highestLevelCharacter = null;
    let otherCharacters = [];

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
                    return { server: serverName, result: `서버: ${serverName}, 정보를 찾을 수 없습니다.` };
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
                        if (characterData.character_level !== undefined && !isNaN(characterData.character_level)) {
                            const characterInfo = {
                                server: serverName,
                                ocid: ocid,
                                character_level: characterData.character_level
                            };

                            // 현재 서버에서 받아온 캐릭터 레벨이 더 높으면 업데이트
                            if (!highestLevelCharacter || characterData.character_level > highestLevelCharacter.character_level) {
                                highestLevelCharacter = characterInfo;
                            } else {
                                otherCharacters.push(characterInfo);
                            }
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        return { server: serverName, result: `서버: ${serverName}, ocid: ${ocid}, Error fetching character/basic: ${error.message}` };
                    });
                }
            })
            .catch(error => {
                console.error(error);
                return { server: serverName, result: `서버: ${serverName}, Error: ${error.message}` };
            });
        })
    )
    .then(() => {
        // Display the result with the highest level
        if (highestLevelCharacter) {
            resultDiv.innerHTML = `서버: ${highestLevelCharacter.server}, ocid: ${highestLevelCharacter.ocid}, character_level: ${highestLevelCharacter.character_level}`;

            // Sort otherCharacters array by character_level in ascending order
            otherCharacters.sort((a, b) => a.character_level - b.character_level);

            // Display other characters
            if (otherCharacters.length > 0) {
                resultDiv.innerHTML += "<br>다른 서버 캐릭터들:<br>" + otherCharacters.map(character => `서버: ${character.server}, ocid: ${character.ocid}, character_level: ${character.character_level}`).join("<br>");
            }
        } else {
            resultDiv.textContent = "모든 서버에서 캐릭터를 찾을 수 없습니다.";
        }
    })
    .catch(error => {
        console.error(error);
        resultDiv.textContent = `Error: ${error.message}`;
    });
}
