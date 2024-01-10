document.addEventListener('DOMContentLoaded', function () {
    // WASM 모듈을 비동기적으로 로드
    const wasmModule = (async () => {
        const response = await fetch('./main.wasm');
        const buffer = await response.arrayBuffer();
        const result = await WebAssembly.instantiate(buffer, {
            env: {
                // 기존 import 선언들...
            },
            wasi_snapshot_preview1: {
                proc_exit: () => {},
                fd_write: () => {},
                fd_close: () => {},
                fd_seek: () => {},
                environ_sizes_get: () => {},
                environ_get: () => {},
                args_sizes_get: () => {},
                args_get: () => {},
                clock_res_get: () => {},
                clock_time_get: () => {},
            },
        });
        return result.instance;
    })();

    // WASM 모듈이 로드된 후 실행될 함수
    wasmModule.then(instance => {
        // WASM에서 API 키 가져오기
        const wasmApiKey = new TextDecoder('utf-8').decode(instance.exports.main());

        // 여기에서 필요한 작업 수행
        console.log('Received API Key from WASM:', wasmApiKey);

        // 이제 API 키를 사용하여 원하는 작업을 수행할 수 있습니다.
        // 예를 들어, fetchCharacterInfo 함수 내에서 사용할 수 있습니다.
        fetchCharacterInfo(wasmApiKey);
    });
});

async function fetchCharacterInfo(apiKey) {
    const characterNameInput = document.getElementById("characterName");
    const characterName = encodeURIComponent(characterNameInput.value.trim()); 

    // 이제 apiKey를 사용하여 필요한 작업을 수행합니다.
    // 예: 서버에 API 키와 characterName을 전송하여 정보를 가져오는 등
    console.log('Fetching character info with API Key:', apiKey, 'and character name:', characterName);
    
    if (!characterName) {
        alert("수행자명을 입력 후 검색해주세요.");
        return;
    }
    // 나머지 fetchCharacterInfo 함수 구현

    document.querySelector('.mychar').innerHTML = ""; // Clear previous character details
    document.querySelector('.char-subinfo3-content3').innerHTML = "";
    document.querySelector('.char-subinfo3-content4').innerHTML = "";
    document.querySelector('.sub12-img').innerHTML = "";
    document.querySelector('.sub12-title').innerHTML = "";
    document.querySelector('.sub12-titleinfo').innerHTML = "";
    document.querySelector('.sub22-img').innerHTML = "";
    document.querySelector('.sub22-title').innerHTML = "";
    document.querySelector('.sub22-titleinfo').innerHTML = "";
    document.querySelector('.sub32-img').innerHTML = "";
    document.querySelector('.sub32-title').innerHTML = "";
    document.querySelector('.sub32-titleinfo').innerHTML = "";
    
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

        // Filter out characters from 달 권역 서버 (낙랑, 하백, 비류, 온조) with character_date_create after 2023-09-21
        const moonZoneCharacters = otherServers.filter(
            server => (server.server === '낙랑' || server.server === '하백' || server.server === '비류' || server.server === '온조') && new Date(server.character_date_create) > new Date('2023-09-21')
        );
        //console.log(moonZoneCharacters)

        // If there are moonZoneCharacters, choose the first one as highestLevelCharacter
        if (moonZoneCharacters.length > 0) {
            highestLevelCharacter = moonZoneCharacters[0];
        }
        
        // Display the result with the highest level
        if (highestLevelCharacter) {
            // Create three div elements
            const serverDiv = document.createElement("div");
            const ocidDiv = document.createElement("div");
            const characterNameDiv = document.createElement("div");
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
            //1차 추가
            const characterClassGroupImage = document.createElement("img");
            const characterClassGroupName = highestLevelCharacter.character_class_group_name;
            //const characterTitleEquipped = highestLevelCharacter.titleEquipment;

            // Process titles and assign values to titleEquipDiv variables
            //let titleEquipDiv1 = "-"; // Default value for char-subinfo3-content1
            //let titleEquipDiv2 = "-"; // Default value for char-subinfo3-content2
            //let titleEquipDiv3 = "-"; // Default value for char-subinfo3-content3
            //let titleEquipDiv4 = "-"; // Default value for char-subinfo3-content4

            if (characterClassGroupName) {
                const imageUrl = `Assets/chars/${characterClassGroupName}.png`;
                characterClassGroupImage.src = imageUrl;
            }
            
            // Assign values to the div elements - 여긴 지워도 되려나?
            /*
            serverDiv.textContent = `${highestLevelCharacter.server}`;
            ocidDiv.textContent = `${highestLevelCharacter.ocid}`;
            characterNameDiv.textContent = `${highestLevelCharacter.character_name}`;
            characterLevelDiv.textContent = `${highestLevelCharacter.character_level}`;
            characterDateDiv.textContent = `${highestLevelCharacter.character_date_create}`;
            characterClassGroupDiv.textContent = `${highestLevelCharacter.character_class_group_name}`;
            characterClassDiv.textContent = `${highestLevelCharacter.character_class_name}`;
            characterNationDiv.textContent = `${highestLevelCharacter.character_nation}`;
            characterGenderDiv.textContent = `${highestLevelCharacter.character_gender}`;
            characterExpDiv.textContent = `${highestLevelCharacter.character_exp}`;
            titleEquipDiv.textContent = `${highestLevelCharacter.titleEquipment}`;
            titleDiv.textContent = `${(highestLevelCharacter.titles)}`;
            */
            
            // Append the div elements to the content-main div
            /*
            resultDiv.appendChild(serverDiv);
            resultDiv.appendChild(ocidDiv);
            resultDiv.appendChild(characterNameDiv);
            resultDiv.appendChild(characterLevelDiv);
            resultDiv.appendChild(characterDateDiv);
            resultDiv.appendChild(characterClassGroupDiv);
            resultDiv.appendChild(characterClassDiv);
            //resultDiv.appendChild(characterClassImage);
            
            resultDiv.appendChild(characterNationDiv);
            resultDiv.appendChild(characterGenderDiv);
            resultDiv.appendChild(characterExpDiv);
            resultDiv.appendChild(titleEquipDiv);
            resultDiv.appendChild(titleDiv);
            */
            
            // Append xxxDiv to char-subinfo#-content#
            document.querySelector('.mychar').appendChild(characterClassGroupImage);
            //document.querySelector('.char-subinfo2-content2').appendChild(characterClassImage); - 직업 아이콘 추가하려는데 실패함
            document.querySelector('.mychar-leftinfo1').textContent = `Lv.${highestLevelCharacter.character_level} l ${highestLevelCharacter.character_class_name} l ${highestLevelCharacter.character_nation}`;
            document.querySelector('.mychar-server1').textContent = `${highestLevelCharacter.server}`;
            document.querySelector('.char-subinfo1-content1').textContent = `${highestLevelCharacter.character_name}`;
            document.querySelector('.mychar-name1').textContent = `${highestLevelCharacter.character_name}`;
            document.querySelector('.char-subinfo1-content2').textContent = `${highestLevelCharacter.server}`;
            document.querySelector('.char-subinfo1-content3').textContent = `${highestLevelCharacter.character_nation}`;
            
            const date = new Date(highestLevelCharacter.character_date_create);
            const formattedDate = date.toISOString().split('T')[0];
            document.querySelector('.char-subinfo1-content4').textContent = formattedDate;
            //document.querySelector('.char-subinfo1-content4').textContent = `${highestLevelCharacter.character_date_create}`;

            document.querySelector('.char-subinfo2-content1').textContent = `${highestLevelCharacter.character_class_group_name}`;
            document.querySelector('.char-subinfo2-content2').textContent = `${highestLevelCharacter.character_class_name}`;
            document.querySelector('.char-subinfo2-content3').textContent = `${highestLevelCharacter.character_level}`;
            document.querySelector('.char-subinfo2-content4').textContent = `${highestLevelCharacter.character_exp}`;

            //240108 작업필요
            var titleEquipment = highestLevelCharacter.titleEquipment;
            //console.log(titleEquipment)
            
            if (titleEquipment) {
                const titleEquipments = titleEquipment.split(',').map(title => title.trim()); // 타이틀을 ','로 구분하여 배열로 나눔
                
                titleEquipments.forEach((title, index) => {
                    const extractedTitleType = title.replace(/:.+$/, '').trim();
                    const extractedTitle = title.replace(/^.+:/, '').trim();
                    const contentElement = document.querySelector(`.char-subinfo3-content${index + 1}`);

                    //console.log(index, extractedTitleType, extractedTitle)
                    
                    if (contentElement) {
                        switch (index) {
                                 case 0:
                                    // Display in char-subinfo3-content1
                                    contentElement.textContent = extractedTitle;
                                    break;
                                case 1:
                                    // Display in char-subinfo3-content2
                                    contentElement.textContent = extractedTitle;
                                    document.querySelector('.mychar-title1').textContent = extractedTitle;
                                    break;
                                case 2:
                                    // Display in char-subinfo3-content3
                                    if (extractedTitleType === '특수') {
                                        const rank1 = getRankFromMiddleWord(extractMiddleWord(extractedTitle));
                                        const rank2 = getRankFromThirdWord(extractThirdWord(extractedTitle));
                                        contentElement.textContent = extractedTitle;
                                        document.querySelector('.sub22-title').textContent = rank1;
                                        document.querySelector('.sub22-titleinfo').textContent = rank2;
                                    } else if (extractedTitleType === '공성') {
                                        // 이미지 코드 추가
                                        const castleImageSrc2 = getCastleImageSrc2(extractedTitle);
                                        let castleImage2 = document.querySelector('.sub32-img img');
                                        if (!castleImage2) {
                                            castleImage2 = document.createElement('img');
                                            document.querySelector('.sub32-img').appendChild(castleImage2);
                                        }
                                        castleImage2.style.width = '25px';
                                        castleImage2.style.height = '25px';
                                        castleImage2.src = castleImageSrc2;
                                        
                                        document.querySelector('.char-subinfo3-content4').textContent = extractedTitle;
                                        document.querySelector('.sub32-title').textContent = extractFourthTitleWord(extractedTitle);
                                        document.querySelector('.sub32-titleinfo').textContent = extractedTitle;
                                    } else { // 신규 추가 240108 13시
                                        contentElement.textContent = '';
                                    }
                                    break;
                                case 3:
                                    // Display in char-subinfo3-content4
                                    if (extractedTitleType === '공성') {
                                        // 이미지 코드 추가
                                        const castleImageSrc2 = getCastleImageSrc2(extractedTitle);
                                        let castleImage2 = document.querySelector('.sub32-img img');
                                        if (!castleImage2) {
                                            castleImage2 = document.createElement('img');
                                            document.querySelector('.sub32-img').appendChild(castleImage2);
                                        }
                                        castleImage2.style.width = '25px';
                                        castleImage2.style.height = '25px';
                                        castleImage2.src = castleImageSrc2;
                                        
                                        const rank4 = extractFourthTitleWord(extractedTitle);
                                        contentElement.textContent = extractedTitle;
                                        document.querySelector('.sub32-title').textContent = rank4;
                                        document.querySelector('.sub32-titleinfo').textContent = extractedTitle;
                                    } else {
                                        contentElement.textContent = '';
                                    }
                                    break;
                                default:
                                    break;
                        }
                    }
                });
            }

            var chartitle = highestLevelCharacter.titles;

            if (chartitle) {
                const myTitles = chartitle.split(',').map(mytitle => mytitle.trim());
            
                // Extract the last 5 titles if there are more than 5 titles
                const recentTitles = myTitles.length >= 5 ? myTitles.slice(-5) : myTitles;
            
                // Apply replace to each title in the array
                const extractedRecentTitles = recentTitles.map(title => title.replace(/^.+:/, '').trim());
            
                // Join the modified titles into a single string
                const extractedRecentTitle = extractedRecentTitles.join(' l '); // 구분자

                document.querySelector('.char-tag-content').textContent = extractedRecentTitle;

                // Display the '성을 정복한 자' title in char-tag-content2
                const conquestTitles = recentTitles.filter(title => title.includes('성을 정복한 자'));

                if (conquestTitles.length > 0) {
                    const latestConquestTitle = conquestTitles[conquestTitles.length - 1];
                    const modifiedLatestConquestTitle = latestConquestTitle.replace(/^일반: /, '');
                    const castleName = extractCastleWord(modifiedLatestConquestTitle);
                    
                    // 이미지용 코드추가
                    const castleImageSrc = getCastleImageSrc(castleName);

                    // 이미지 변경을 위한 코드
                    let castleImage = document.querySelector('.sub12-img img');
                    // 이미지가 없으면 새로운 img 태그를 생성
                    if (!castleImage) {
                        castleImage = document.createElement('img');
                        document.querySelector('.sub12-img').appendChild(castleImage);
                        //document.querySelector('.sub12-upper').insertBefore(castleImage, document.querySelector('.sub12-title'));
                    }
                    castleImage.style.width = '25px'; // 25px로 수정 (원래는 30px로 되어 있었음)
                    castleImage.style.height = '25px'; // 25px로 수정 (원래는 30px로 되어 있었음)
                    castleImage.src = castleImageSrc;
                    
                    document.querySelector('.sub12-title').textContent = castleName;
                    document.querySelector('.sub12-titleinfo').textContent = modifiedLatestConquestTitle;
                } else {
                    // Handle the case when there are no conquest titles
                    document.querySelector('.sub12-title').textContent = ''; // Clear the content
                    document.querySelector('.sub12-titleinfo').textContent = ''; // Clear the content
                    document.querySelector('.sub12-img').src = ''; // Clear the image source
                    //document.querySelector('.sub12-img').alt = ''; // Clear the image alt text
                }
                //console.log(recentTitles)
            }

            // 서버 값을 가져옴
            const serverName = highestLevelCharacter.server;
            
            // 서버 이름에 따라 '해' 또는 '달'을 결정
            const serverSymbol = serverName === '연' || serverName === '무휼' || serverName === '세류' || serverName === '해명' ? '해' : '달';
            
            // 출력
            document.querySelector('.sub13-content2').textContent = serverName;
            document.querySelector('.sub23-content2').textContent = serverName;
            document.querySelector('.sub33-content2').textContent = serverName;
            
            document.querySelector('.sub13-content1').textContent = serverSymbol;
            document.querySelector('.sub23-content1').textContent = serverSymbol;
            document.querySelector('.sub33-content1').textContent = serverSymbol;

            //document.querySelector('.char-subinfo3-content1').textContent = `${highestLevelCharacter.titleEquipment}`;
            //document.querySelector('.char-subinfo3-content2').textContent = `${titleEquipDiv2}`;
            //document.querySelector('.char-subinfo3-content3').textContent = `${titleEquipDiv3}`;
            //document.querySelector('.char-subinfo3-content4').textContent = `${titleEquipDiv4}`;
        
            // Sort otherServers array by character_level in ascending order
            otherServers.sort((a, b) => a.character_level - b.character_level);
    
            // Display other servers
            /*
            if (otherServers.length > 0) {
                const otherServersDiv = document.createElement("div");
                otherServersDiv.innerHTML = otherServers.map(server => server.server).join(" l "); // 구분자
                resultDiv.appendChild(otherServersDiv);
            }
            */
        // Display other servers
        if (moonZoneCharacters.length > 0) {
            // If there are moonZoneCharacters, show only moonZone servers
            const moonZoneServersDiv = document.createElement("div");
            moonZoneServersDiv.innerHTML = moonZoneCharacters.map(server => server.server).join(" l "); // 구분자
            resultDiv.appendChild(moonZoneServersDiv);
        } else {
            // If there are no moonZoneCharacters, show other servers
            const otherServersDiv = document.createElement("div");
            const nonMoonZoneServers = otherServers.filter(server => !['낙랑', '하백', '비류', '온조'].includes(server.server));
            otherServersDiv.innerHTML = nonMoonZoneServers.map(server => server.server).join(" l "); // 구분자
            resultDiv.appendChild(otherServersDiv);
        }

            document.querySelector('.content-sub').appendChild(titleDiv);

            document.querySelector('.content-main').style.display = 'block';
            document.querySelector('.content-sub').style.display = 'block';
            document.querySelector('.cb-section2').style.backgroundColor = 'rgba(0, 0, 0, .12)';
        } else {
            document.querySelector('.content-main').style.display = 'none';
            document.querySelector('.content-sub').style.display = 'none';
            document.querySelector('.cb-section2').style.backgroundColor = '#333';
            resultDiv.textContent = "모든 서버에서 캐릭터를 찾을 수 없습니다.";
            //document.querySelector('.cb-section1').textContent = '캐릭을 찾을 수 없습니다.';

            // 이미지를 감싸는 .cb-section1 요소 선택
            const section1Element = document.querySelector('.cb-section1');
            // 이미지 뒤에 텍스트를 추가하는 요소를 생성하고 스타일을 설정
            const errorMessageElement = document.createElement('div');
            errorMessageElement.textContent = "캐릭터를 찾을 수 없습니다.";
            errorMessageElement.classList.add('error-message'); // 텍스트 스타일이나 위치 등을 위한 클래스 부여
            section1Element.appendChild(errorMessageElement);
            //section1Element.insertBefore(errorMessageElement, section1Element.firstChild);

            const errorMessageStyle = `
                position: relative;
                font-size: 60px;
                font-weight: bold;
                text-align: center;
                color: black; /* 텍스트 색상 설정 */
                z-index: 5;
                top: 50%;
                transform: translateY(-50%);
            `;

            const section1Style = `
                position: relative;
                z-index: 1; /* 이미지 감싸는 요소의 z-index 설정 */
            `;

            document.querySelector('.error-message').style.cssText = errorMessageStyle;
            section1Element.style.cssText = section1Style;
            document.querySelector('.error-message').style.cssText = errorMessageStyle;
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
    imageMap.set('천선', 'Assets/icons/천선(6차).png');
    
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
        return null; // default img 넣어주기 "default_class_image.png";
    }
}

function extractMiddleWord(title) {
    const words = title.split(' ');
    if (words.length === 3) {
        // Return the middle word (index 1)
        return words[1];
    }
    return '';
}

function getRankFromMiddleWord(middleWord) {
    // Map specific values based on the middle word
    switch (middleWord) {
        case '미궁의':
            showImage('미궁의');
            return '전투력 랭커(일반)';
        case '영광의':
            showImage('영광의');
            return '전투력 랭커(대인)';
        case '불멸의':
            showImage('불멸의');
            return '전투력 랭커(보스)';
        case '패기의':
            showImage('패기의');
            return '전투력 상승왕(일반)';
        case '투지의':
            showImage('투지의');
            return '전투력 상승왕(대인)';
        case '투쟁의':
            showImage('투쟁의');
            return '전투력 상승왕(보스)';
        case '파괴의':
            showImage('파괴의');
            return 'PK 중독자';
        // Add more cases for other middle words if needed
        default:
            return '';
    }
}

function extractThirdWord(title) {
    const words = title.split(' ');
    if (words.length === 3) {
        // Return the third word (index 2)
        return words[2];
    }
    return '';
}

function getRankFromThirdWord(thirdWord) {
    // Map specific values based on the third word
    switch (thirdWord) {
        case '제왕':
            return '1위';
        case '대왕':
            return '2위';
        case '소왕':
            return '3위';
        case '화신':
            return '4~10위권';
        case '전설':
            return '11~20위권';
        case '영웅':
            return '21~40위권';
        case '정복자':
            return '41~70위권';
        case '선구자':
            return '71~100위권';
        // Add more cases for other third words if needed
        default:
            return '';
    }
}

function extractFourthTitleWord(fourthtitle) {
    const words = fourthtitle.split(' ');
    // Always split the first word by '의'
    if (words.length >= 1) {
        // Split the first word by '의'
        const subWords = words[0].split('의');
        // Return the first part after '의'
        return subWords.length >= 2 ? subWords[0].trim() + '성 점령자' : subWords[0].trim() + '성 점령자';
    } else {
        // Return '' for other cases
        return ;
    }
}

function getCastleImageSrc2(castleInfo) {
    const words2 = castleInfo.split(' ');
    console.log(words2);
    console.log(words2.length);
    if (words2.length >= 2) {
        const subWords2 = words2[1].split('의');
        const castleName2 = subWords2[0].trim();
        console.log(castleName2);
        return `Assets/icons_rect/${castleName2}아이콘_사각.png`;
    } else if (words2.length === 1){
        const subWords2 = words2[0].split('의');
        const castleName2 = subWords2[0].trim();
        console.log(castleName2);
        return `Assets/icons_rect/${castleName2}아이콘_사각.png`;
    } else {
        return '';
    }
}

function extractCastleWord(conquestTitle) {
    const words = conquestTitle.split('을');
    return words.length > 0 ? words[0] : '';
}

function getCastleImageSrc(castleName) {
    // 고구려 성
    if (castleName === '숙군성' || castleName === '평양성' || castleName === '졸본성' || castleName === '오골성' || castleName === '하보산성' || castleName === '낭랑산성' || castleName === '후연성' || castleName === '개주성' || castleName === '용성' || castleName === '오녀산성') {
        return 'Assets/icons_rect/요새_고구려.jpg';
    }
    // 부여 성
    else if (castleName === '장훈성' || castleName === '동부여성' || castleName === '송원성' || castleName === '가섭원성' || castleName === '용담산성' || castleName === '동단산성' || castleName === '상곡성' || castleName === '어양성' || castleName === '읍루성' || castleName === '범안성') {
        return 'Assets/icons_rect/요새_부여.jpg';
    }
    // 중국 성
    else if (castleName === '만리장성' || castleName === '대방성' || castleName === '현도성' || castleName === '낙양성' || castleName === '장안성' || castleName === '강서성' || castleName === '복건성' || castleName === '광둥성' || castleName === '산시성' || castleName === '산둥성') {
        return 'Assets/icons_rect/요새_중국.jpg';
    }
    else {
        return ''; // 기본값으로 빈 문자열 반환 또는 다른 기본 이미지 설정
    }
}

function showImage(imageName) {
    const imageSrc = `Assets/icons_rect/${imageName}.png`;
    let imageElement = document.querySelector('.sub22-img img');
    if (!imageElement) {
        imageElement = document.createElement('img');
        document.querySelector('.sub22-img').appendChild(imageElement);
    }
    imageElement.style.width = '25px';
    imageElement.style.height = '25px';
    imageElement.src = imageSrc;
}
