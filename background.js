let color = '#3aa757';

// eslint-disable-next-line no-undef
chrome.runtime.onInstalled.addListener(() => {
  // eslint-disable-next-line no-undef
  chrome.storage.sync.set({ color });
  console.log('Default background color set to %cgreen', `color: ${color}`);
});