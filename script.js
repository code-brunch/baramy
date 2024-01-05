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
});

async function fetchCharacterInfo() {
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
    const characterNameInput = document.getElementById("characterName");
    const characterName = encodeURIComponent(characterNameInput.value.trim()); // trim을 사용하여 공백 제거

    if (!characterName) {
        alert("캐릭터명을 입력 후 검색해주세요.");
        return;
    }

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

                const titleEquipmentResponse = await fetch(`https://open.api.nexon.com/baramy/v1/character/title-equipment?ocid=${ocid}`, {
                headers: {
                    "x-nxopen-api-key": apiKey,
                },
                });
    
                const titleEquipmentData = await titleEquipmentResponse.json();
    
                const titleResponse = await fetch(`https://open.api.nexon.com/baramy/v1/character/title?ocid=${ocid}`, {
                    headers: {
                        "x-nxopen-api-key": apiKey,
                    },
                });

            const titleData = await titleResponse.json();

                if (characterData.character_level !== undefined && !isNaN(characterData.character_level)) {
                    const characterInfo = {
                        server: serverName,
                        ocid: ocid,
                        character_level: characterData.character_level,
                        character_name: characterData.character_name,
                        character_date_create: characterData.character_date_create,
                        character_class_group_name: characterData.character_class_group_name,
                        character_class_name: characterData.character_class_name,
                        character_nation: characterData.character_nation,
                        character_gender: characterData.character_gender,
                        character_exp: characterData.character_exp,
                        titleEquipment: processTitles(titleEquipmentData.title_equipment),
                        titles: processTitles(titleData.title),
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
            // Create three div elements
            const serverDiv = document.createElement("div");
            const ocidDiv = document.createElement("div");
            const characterLevelDiv = document.createElement("div");
            const characterDateDiv = document.createElement("div");
            const characterClassGroupDiv = document.createElement("div");
            const characterClassDiv = document.createElement("div");
            const characterNationDiv = document.createElement("div");
            const characterGenderDiv = document.createElement("div");
            const characterExpDiv = document.createElement("div");
            const titleEquipDiv = document.createElement("div");
            const titleDiv = document.createElement("div");
            
            // Assign values to the div elements
            serverDiv.textContent = `서버: ${highestLevelCharacter.server}`;
            ocidDiv.textContent = `ocid: ${highestLevelCharacter.ocid}`;
            characterLevelDiv.textContent = `레벨: ${highestLevelCharacter.character_level}`;
            characterDateDiv.textContent = `생성일: ${highestLevelCharacter.character_date_create}`;
            characterClassGroupDiv.textContent = `직업: ${highestLevelCharacter.character_class_group_name}`;
            characterClassDiv.textContent = `승급: ${highestLevelCharacter.character_class_name}`;
            characterNationDiv.textContent = `국가: ${highestLevelCharacter.character_nation}`;
            characterGenderDiv.textContent = `성별: ${highestLevelCharacter.character_gender}`;
            characterExpDiv.textContent = `경험치: ${highestLevelCharacter.character_exp}`;
            titleEquipDiv.textContent = `장착칭호: ${highestLevelCharacter.titleEquipment}`;
            titleDiv.textContent = `보유칭호: ${(highestLevelCharacter.titles)}`;
    
            // Append the div elements to the content-main div
            resultDiv.appendChild(serverDiv);
            resultDiv.appendChild(ocidDiv);
            resultDiv.appendChild(characterLevelDiv);
            resultDiv.appendChild(characterDateDiv);
            resultDiv.appendChild(characterClassGroupDiv);
            resultDiv.appendChild(characterClassDiv);
            resultDiv.appendChild(characterNationDiv);
            resultDiv.appendChild(characterGenderDiv);
            resultDiv.appendChild(characterExpDiv);
            resultDiv.appendChild(titleEquipDiv);
            resultDiv.appendChild(titleDiv);
    
            // Sort otherServers array by character_level in ascending order
            otherServers.sort((a, b) => a.character_level - b.character_level);
    
            // Display other servers
            if (otherServers.length > 0) {
                const otherServersDiv = document.createElement("div");
                otherServersDiv.innerHTML = "<br>다른 서버 캐릭터들(server_name 기준으로 정렬):<br>" + otherServers.map(server => server.server).join("<br>");
                resultDiv.appendChild(otherServersDiv);
            }

            document.querySelector('.content-sub').appendChild(titleDiv);
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

function processTitles(titles) {
    if (!Array.isArray(titles)) {
        return "N/A";
    }

    return titles.map(title => {
        if (title.title_type_name && title.title_name) {
            return `${title.title_type_name}: ${title.title_name}`;
        } else {
            console.log("Invalid title object:", title);
            return "N/A";
        }
    }).join(", ");
}

