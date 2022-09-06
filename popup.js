// Initialize button with user's preferred color
let changeColor = document.getElementById("changeColor");

// eslint-disable-next-line no-undef
chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});