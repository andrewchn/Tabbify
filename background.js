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

let SELECTED_SONG = {};

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

                GenerateSong();
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
    // console.log(ACCESS_TOKEN);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + ACCESS_TOKEN,
    };

    var response = await fetch(
      "https://api.spotify.com/v1/me/following?type=artist",
      { headers }
    );
    const data = await response.json();
    // console.log("data: " + JSON.stringify(data));

    let artistList = data["artists"]["items"];

    const randArtist =
      artistList[Math.floor(Math.random() * artistList.length)];

    // console.log("artist: ");
    // console.log(randArtist);

    return GetRandArtistAlbum(randArtist);
  } catch (error) {
    console.log(error);
  }
}

async function GetRandArtistAlbum(artist) {
  try {
    let id = artist["uri"].substring(15);
    // console.log(id);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + ACCESS_TOKEN,
    };

    var response = await fetch(
      `https://api.spotify.com/v1/artists/${id}/albums`,
      { headers }
    );
    const data = await response.json();

    // console.log("data: " + JSON.stringify(data));

    let albumList = data["items"];

    const randAlbum = albumList[Math.floor(Math.random() * albumList.length)];

    // console.log("album: ");
    // console.log(randAlbum);
    return GetRandSong(randAlbum);
  } catch (error) {
    console.log(error);
  }
}

async function GetRandSong(album) {
  try {
    let id = album["id"];
    // console.log(id);
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: "Bearer " + ACCESS_TOKEN,
    };

    var response = await fetch(
      `	https://api.spotify.com/v1/albums/${id}/tracks`,
      { headers }
    );
    const data = await response.json();

    // console.log("data: " + JSON.stringify(data));

    let trackList = data["items"];

    const randSong = trackList[Math.floor(Math.random() * trackList.length)];

    // console.log("song: ");
    // console.log(randSong);

    // SELECTED_SONG = randSong;
    return randSong;
  } catch (error) {
    console.log(error);
  }
}

async function GenerateSong() {
    GetRandFollowedArtist().then((r) => {
    SELECTED_SONG = r;
    console.log("selected song: " + JSON.stringify(SELECTED_SONG));
  });
  // GenerateSongHelper();
}


// chrome.tabs.onCreated.addListener(GenerateSong());
