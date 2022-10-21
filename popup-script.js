document.querySelector('#sign-in').addEventListener('click', function () {
    chrome.runtime.sendMessage({ message: 'login' }, function (response) {
        console.log("signing in");
        if (response.message === 'success') window.close();
    });
});