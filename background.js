const CLIENT_ID = encodeURIComponent("7fa6d6952688403289c1e0c0a4ffbcdf");
const RESPONSE_TYPE = encodeURIComponent("token");
const REDIRECT_URI = encodeURIComponent(
  "https://gmnjbadoghkkkpacagkababjciklnocn.chromiumapp.org/"
);
const SCOPE = encodeURIComponent(
  "user-read-email user-read-private user-follow-read"
);
const SHOW_DIALOG = encodeURIComponent("true");
let STATE = "";
let ACCESS_TOKEN = "";

let user_signed_in = false;

let SONG_IMAGE_URL = "";
let SONG_NAME = "";
let NO_FOLLOW = false;
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
                user_signed_in = true;

                setTimeout(() => {
                  ACCESS_TOKEN = "";
                  user_signed_in = false;
                }, 3600000);

                // GetPlaylists();
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

async function GetRandFollowedArtist() {
  try {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + ACCESS_TOKEN,
    };

    return fetch("https://api.spotify.com/v1/me/following?type=artist", {
      headers,
    })
      .then((response) => response.json())
      .then((data) => {
        let artistList = data["artists"]["items"];
        if (artistList.length === 0) {
          return {};
        }
        const randArtist =
          artistList[Math.floor(Math.random() * artistList.length)];

        return GetRandArtistAlbum(randArtist);
      });
  } catch (error) {
    console.log(error);
  }
}

async function GetRandArtistAlbum(artist) {
  try {
    let id = artist["uri"].substring(15);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + ACCESS_TOKEN,
    };

    return fetch(`https://api.spotify.com/v1/artists/${id}/albums`, { headers })
      .then((response) => response.json())
      .then((data) => {
        let albumList = data["items"];

        const randAlbum =
          albumList[Math.floor(Math.random() * albumList.length)];

        SONG_IMAGE_URL = randAlbum["images"][0]["url"];
        console.log("selected song image: " + JSON.stringify(SONG_IMAGE_URL));

        return GetRandSong(randAlbum);
      });
  } catch (error) {
    console.log(error);
  }
}

async function GetRandSong(album) {
  try {
    let id = album["id"];
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + ACCESS_TOKEN,
    };

    return fetch(`https://api.spotify.com/v1/albums/${id}/tracks`, { headers })
      .then((response) => response.json())
      .then((data) => {
        let trackList = data["items"];

        const randSong =
          trackList[Math.floor(Math.random() * trackList.length)];

        return randSong;
      });
  } catch (error) {
    console.log(error);
  }
}

async function GenerateSong() {
  GetRandFollowedArtist().then((r) => {
    if (Object.keys(r).length === 0) {
      NO_FOLLOW = true;
    } else {
      SONG_NAME = r["name"];
      console.log("selected song: " + SONG_NAME);
    }
  });
}


chrome.runtime.onConnect.addListener(function (port) {
  if (user_signed_in) {
    port.onMessage.addListener(function (msg) {
      GenerateSong().then(() => {
        if (msg == "song request") {
          if (NO_FOLLOW) {
            port.postMessage(JSON.stringify({err: "no-follow"}));
          } else {
            port.postMessage(JSON.stringify({name : SONG_NAME, img : SONG_IMAGE_URL, err : ""}));
          }
        } else {
          console.log("msg not recognized");
        }
      });
    });
  }
});
