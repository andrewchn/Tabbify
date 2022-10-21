var port = chrome.runtime.connect({
  name: "chanel",
});

port.postMessage("song request");

port.onMessage.addListener(function (msg) {
  console.log("msg : " + msg);
  msgJson = JSON.parse(msg);
  if (msgJson.err === "no-follow") {
    console.log("nofala");
    document.getElementById("song-img").src = "images/blank.jpg";
    document.getElementById("song-name").textContent =
      "bruh follow some artists";
  } else {
    document.getElementById("song-img").src = msgJson.img;
    document.getElementById("song-name").textContent = msgJson.name;
  }
});

document.querySelector("#sign-out").addEventListener("click", function () {
  chrome.runtime.sendMessage({ message: "logout" }, function (response) {
    console.log("sign out");
    if (response.message === "success") window.close();
  });
});
