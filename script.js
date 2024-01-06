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
    const apiKey = "test_ad6c0a6934215fad4b75dfc81d40caa0fc195af0fccda90f8413fc1752215176c98f6cd472d4226608ef1a241f84aa9c";
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
            const characterClassImage = document.createElement("img");
            characterClassImage.src = getCharacterClassImage(highestLevelCharacter.character_class_name);
            

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
            characterClassDiv.appendChild(characterClassImage);
            
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

function getCharacterClassImage(characterClassName) {
    var imageMap = new Map();
    // 전사
    imageMap.set('검객', 'Assets/icons/검객(1차).png');
    imageMap.set('검제', 'Assets/icons/검제(2차).png');
    imageMap.set('검황', 'Assets/icons/검황(3차).png');
    imageMap.set('검성', 'Assets/icons/검성(4차).png');
    imageMap.set('검신', 'Assets/icons/검신(5차).png');
    imageMap.set('검천', 'Assets/icons/검천(6차).png');
    
    // 도적
    imageMap.set('자객', 'Assets/icons/자객(1차).png');
    imageMap.set('진검', 'Assets/icons/진검(2차).png');
    imageMap.set('귀검', 'Assets/icons/귀검(3차).png');
    imageMap.set('태성', 'Assets/icons/태성(4차).png');
    imageMap.set('패왕', 'Assets/icons/패왕(5차).png');
    imageMap.set('패황', 'Assets/icons/패황(6차).png');
    
    // 주술사
    imageMap.set('술사', 'Assets/icons/술사(1차).png');
    imageMap.set('현사', 'Assets/icons/현사(2차).png');
    imageMap.set('현인', 'Assets/icons/현인(3차).png');
    imageMap.set('현자', 'Assets/icons/현자(4차).png');    
    imageMap.set('마신', 'Assets/icons/마신(5차).png');
    imageMap.set('마성', 'Assets/icons/마성(6차).png');
    
    // 도사
    imageMap.set('도인', 'Assets/icons/도인(1차).png');
    imageMap.set('명인', 'Assets/icons/명인(2차).png');
    imageMap.set('진인', 'Assets/icons/진인(3차).png');
    imageMap.set('진선', 'Assets/icons/진선(4차).png');
    imageMap.set('신선', 'Assets/icons/신선(5차).png');
    imageMap.set('재천', 'Assets/icons/천선(6차).png');
    
    // 격투가
    imageMap.set('권극', 'Assets/icons/권극(6차).png');
    imageMap.set('권사', 'Assets/icons/권사(1차).png');
    imageMap.set('권신', 'Assets/icons/권신(5차).png');
    imageMap.set('권왕', 'Assets/icons/권왕(3차).png');
    imageMap.set('권제', 'Assets/icons/권제(4차).png');
    imageMap.set('권호', 'Assets/icons/권호(2차).png');
    
    // 궁사
    imageMap.set('명궁', 'Assets/icons/명궁(1차).png');
    imageMap.set('현궁', 'Assets/icons/현궁(2차).png');
    imageMap.set('진탄', 'Assets/icons/진탄(3차).png');
    imageMap.set('심안', 'Assets/icons/심안(4차).png');
    imageMap.set('신궁', 'Assets/icons/신궁(5차).png');
    imageMap.set('천궁', 'Assets/icons/천궁(6차).png');
    
    // 무사
    imageMap.set('창객', 'Assets/icons/창객(1차).png');
    imageMap.set('창제', 'Assets/icons/창제(2차).png');
    imageMap.set('창황', 'Assets/icons/창황(3차).png');
    imageMap.set('창성', 'Assets/icons/창성(4차).png');
    imageMap.set('신창', 'Assets/icons/신창(5차).png');
    imageMap.set('창극', 'Assets/icons/창극(6차).png');
    
    // 천인
    imageMap.set('재천', 'Assets/icons/천랑(1차).png');
    imageMap.set('재천', 'Assets/icons/천무(2차).png');
    imageMap.set('재천', 'Assets/icons/천군(3차).png');
    imageMap.set('천위', 'Assets/icons/천위(4차).png');
    imageMap.set('재천', 'Assets/icons/재천(5차).png');
    imageMap.set('천신', 'Assets/icons/천신(6차).png');

    // 도깨비
    imageMap.set('귀명', 'Assets/icons/귀명(1차).png');
    imageMap.set('귀제', 'Assets/icons/귀제(2차).png');
    imageMap.set('귀황', 'Assets/icons/귀황(3차).png');
    imageMap.set('귀성', 'Assets/icons/귀성(4차).png');
    imageMap.set('신각', 'Assets/icons/신각(5차).png');
    imageMap.set('귀극', 'Assets/icons/귀극(6차).png');
    
    if (imageMap.has(characterClassName)) {
        return imageMap.get(characterClassName);
    } else {
        // 매핑이 없는 경우 기본 이미지를 반환
        console.warn(`이미지를 찾을 수 없습니다. characterClassName: ${characterClassName}`);
        return "default_class_image.png";
    }
}
