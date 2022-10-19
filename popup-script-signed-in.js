// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     console.log("recieved messege");
//     if (request.message == 'set-song') {
//         console.log("received message: " + request.songImage + " " + request.songName);
//         document.getElementById("song-stuff").innerHTML += 
//         `<img src=${request.songImage}> \n <h3>${request.songName}</h3>`
//         sendResponse({message : "success"});
//         return true;
//     }
// });

var port = chrome.runtime.connect({name: "chanel"});
port.onMessage.addListener(function(msg) {
  if (msg.msg === "set-song")
    port.postMessage({msg: "song-set"});
    console.log("song set chanel");
    console.log(msg.name);
    console.log(msg.url);
    return true;
});

document.querySelector('#sign-out').addEventListener('click', function () {
    chrome.runtime.sendMessage({ message: 'logout' }, function (response) {
        console.log("sign out");
        if (response.message === 'success') window.close();
    });
});