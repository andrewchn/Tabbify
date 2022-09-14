
const CLIENT_ID = encodeURIComponent("7fa6d6952688403289c1e0c0a4ffbcdf");
const RESPONSE_TYPE = encodeURIComponent("token");
const REDIRECT_URI = encodeURIComponent(
  "https://gmnjbadoghkkkpacagkababjciklnocn.chromiumapp.org/"
);
const SCOPE = encodeURIComponent("user-read-email user-follow-read");
const SHOW_DIALOG = encodeURIComponent("true");
let STATE = "";
let ACCESS_TOKEN = "";

let user_signed_in = false;

let selected_song = {
  "artist": null,
  "song": null
}

function create_spotify_endpoint() {
  STATE = encodeURIComponent(
    "meet" + Math.random().toString(36).substring(2, 15)
  );

  let oauth2_url = `https://accounts.spotify.com/authorize
?client_id=${CLIENT_ID}
&response_type=${RESPONSE_TYPE}
&redirect_uri=${REDIRECT_URI}
&state=${STATE}
&scope=${SCOPE}
&show_dialog=${SHOW_DIALOG}
`;

  console.log(oauth2_url);

  return oauth2_url;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "login") {
    if (user_signed_in) {
      console.log("User is already signed in.");
    } else {
      // sign the user in with Spotify
      console.log("background sign in");
      chrome.identity.launchWebAuthFlow(
        {
          url: create_spotify_endpoint(),
          interactive: true,
        },
        function (redirect_url) {
          if (chrome.runtime.lastError) {
            sendResponse({ message: "fail" });
          } else {
            if (redirect_url.includes("callback?error=access_denied")) {
              sendResponse({ message: "fail" });
            } else {
              console.log(redirect_url);
              ACCESS_TOKEN = redirect_url.substring(
                redirect_url.indexOf("access_token=") + 13
              );
              ACCESS_TOKEN = ACCESS_TOKEN.substring(
                0,
                ACCESS_TOKEN.indexOf("&")
              );
              let state = redirect_url.substring(
                redirect_url.indexOf("state=") + 6
              );

              if (state === STATE) {
                console.log("SUCCESS");
                user_signed_in = true;

                setTimeout(() => {
                  ACCESS_TOKEN = "";
                  user_signed_in = false;
                }, 3600000);

                let getMe = GetRandomSong(ACCESS_TOKEN);

                chrome.action.setPopup(
                  { popup: "./popup-signed-in.html" },
                  () => {
                    sendResponse({ message: "success" });
                  }
                );
              } else {
                sendResponse({ message: "fail" });
              }
            }
          }
        }
      );
    }

    return true;
  } else if (request.message === "logout") {
    user_signed_in = false;
    chrome.action.setPopup({ popup: "./popup.html" }, () => {
      sendResponse({ message: "success" });
    });

    return true;
  }
});

function GetRandomSong(token) {
  console.log(token);

  const artistHeaders = { 
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer  ${token}` };

  console.log(JSON.stringify(artistHeaders));
  // let artistJson = fetch('https://api.spotify.com/v1/me/following?type=artist', { artistHeaders });
  // console.log("artistJson: " + JSON.stringify(artistJson));

  fetch('https://api.spotify.com/v1/me/following?type=artist', { artistHeaders }).then(r => r.text()).then(result => {
    console.log(result);
  });
}
// chrome.tabs.onCreated.addListener(
//   callback: function,
// )