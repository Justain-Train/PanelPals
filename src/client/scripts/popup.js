

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const statusDiv = document.getElementById("status");

startButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "startCapture" }, response => {
        if (!response || response.error) {
          statusDiv.innerText = ("Failed to start capture!", response.error);
        } else {
          console.log("Start Capture message sent successfully!");
          statusDiv.innerText = "Started Capture of Screen!";

        }
      });
    } else {
      console.log("No active tab found or tab ID is undefined.");
    }
  });
});

stopButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "stopCapture" }, response => {
        if (!response || response.error) {
          statusDiv.innerText = ("Failed to stop capture!", response.error);
        } else {
          console.log("Stop Capture message sent successfully!");
          statusDiv.innerText = ("Stopped Capture of Screen!");

        }
      });
    } else {
      console.log("No active tab found or tab ID is undefined.");
    }
  });
});






