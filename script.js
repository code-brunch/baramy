const API_KEY = "test_ad6c0a6934215fad4b75dfc81d40caa08ec93cbb06b86feee55ebcbed5a6401040fc9f0162a1fec40ac4b8e45e56924d";
const characterName = "캐릭터명";
const serverName = "서버명";
const urlString = "https://open.api.nexon.com/baramy/v1/id?character_name=" + characterName + "&server_name=" + serverName;

const answer = fetch(urlString, {
    headers:{
      "x-nxopen-api-key": API_KEY
    }
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error))

console.log(answer)
