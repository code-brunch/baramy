document.addEventListener('DOMContentLoaded', function () {
    const characterNameInput = document.getElementById('characterName');

    // 포커스 이벤트 처리
    characterNameInput.addEventListener('focus', function () {
        if (characterNameInput.value === '캐릭터명 또는 길드') {
            characterNameInput.value = '';
        }
    });

    // 포커스 아웃 이벤트 처리
    characterNameInput.addEventListener('blur', function () {
        if (characterNameInput.value === '') {
            characterNameInput.value = '캐릭터명 또는 길드';
        }
    });

    // 검색 버튼 클릭 이벤트 처리
    document.getElementById('searchButton').addEventListener('click', function () {
        const isInputEmpty = characterNameInput.value.trim() === '';

        if (isInputEmpty) {
            alert('캐릭터명을 입력 후 검색해주세요.');
            characterNameInput.focus(); // 검색창에 다시 포커스를 맞춥니다.
        } else {
            fetchCharacterInfo();
        }
    });
});

async function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const characterNameInput = document.getElementById("characterName");
    const characterName = encodeURIComponent(characterNameInput.value.trim()); // trim을 사용하여 공백 제거

    const servers = ["연", "무휼", "세류", "해명", "낙랑", "하백", "비류", "온조"];
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = ""; // Clear previous results
    let highestLevelCharacter = null;
    let otherServers = [];

    const promises = servers.map(async (serverName) => {
        const url = `https://open.api.nexon.com/baramy/v1/id?character_name=${characterName}&server_name=${encodeURIComponent(serverName)}`;

        try {
            const response = await fetch(url, {
                headers: {
                    "x-nxopen-api-key": apiKey,
                },
            });

            const data = await response.json();

            if (data.error) {
                return { server: serverName, result: `서버: ${serverName}, 정보를 찾을 수 없습니다.` };
            } else {
                const ocid = data.ocid;
                const characterResponse = await fetch(`https://open.api.nexon.com/baramy/v1/character/basic?ocid=${ocid}`, {
                    headers: {
                        "x-nxopen-api-key": apiKey,
                    },
                });

                const characterData = await characterResponse.json();

                if (characterData.character_level !== undefined && !isNaN(characterData.character_level)) {
                    const characterInfo = {
                        server: serverName,
                        ocid: ocid,
                        character_level: characterData.character_level,
                    };

                    if (!highestLevelCharacter || characterData.character_level > highestLevelCharacter.character_level) {
                        highestLevelCharacter = characterInfo;
                    }

                    otherServers.push(characterInfo);
                }
            }
        } catch (error) {
            console.error(error);
            return { server: serverName, result: `서버: ${serverName}, Error: ${error.message}` };
        }
    });

    try {
        await Promise.all(promises);

        // Display the result with the highest level
        if (highestLevelCharacter) {
            resultDiv.innerHTML = `서버: ${highestLevelCharacter.server}, ocid: ${highestLevelCharacter.ocid}, character_level: ${highestLevelCharacter.character_level}`;

            // Sort otherServers array by character_level in ascending order
            otherServers.sort((a, b) => a.character_level - b.character_level);

            // Display other servers
            if (otherServers.length > 0) {
                resultDiv.innerHTML += "<br>다른 서버 캐릭터들(server_name 기준으로 정렬):<br>" + otherServers.map(server => server.server).join("<br>");
            }
        } else {
            resultDiv.textContent = "모든 서버에서 캐릭터를 찾을 수 없습니다.";
        }

        // Clear the input value after successful search
        characterNameInput.value = "";
    } catch (error) {
        console.error(error);
        resultDiv.textContent = `Error: ${error.message}`;
    }
}
