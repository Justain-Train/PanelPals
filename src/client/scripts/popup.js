

const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const statusDiv = document.getElementById("status");

startButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "startCapture" }, response => {
        if (!response) {
          console.error("Failed to send message:", chrome.runtime.lastError.message);
        } else {
          console.log("Start Capture message sent successfully!");

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
        if (!response) {
          console.error("Failed to send message:", chrome.runtime.lastError.message);
        } else {
          console.log("Stop Capture message sent successfully!");

        }
      });
    } else {
      console.log("No active tab found or tab ID is undefined.");
    }
  });
});



