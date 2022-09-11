document.querySelector('#sign-out').addEventListener('click', function () {
    chrome.runtime.sendMessage({ message: 'logout' }, function (response) {
        console.log("sign out");
        if (response.message === 'success') window.close();
    });
});