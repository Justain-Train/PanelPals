let isAudioPlaying = false;
let screenshotInterval = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "processImage") {
    detectText(request.imageData)
      .then((text) => createAudioFileFromText(text))
      .then((audioUrl) => {
        sendResponse({ audioUrl });
        isAudioPlaying = true;
        clearInterval(screenshotInterval);
      })
      .catch((error) => {
        console.error("There was an error Processing Image", error);

        sendResponse({
          error: "There was an error Processing Image",
        });
      });
    return true; 
  } else if (request.type === "audioFinished") {
    isAudioPlaying = false;
    startCaptureInterval();
  } else if (request.type === "startCapture") {
    startCaptureInterval();
    sendResponse({ success: true });
  } else if (request.type === "stopCapture") {
    clearInterval(screenshotInterval);
    screenshotInterval = null;
    sendResponse({ success: true });
  }
});

const startCaptureInterval = () => {
  if (screenshotInterval) return;

  screenshotInterval = setInterval(() => {
    if (!isAudioPlaying) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: "takeScreenshot" }, response => {
            if (chrome.runtime.lastError) {
              console.error("Failed to send message:", chrome.runtime.lastError.message);
            } else {
              console.log("Screenshot message sent successfully!");
            }
          });
        } else {
          console.log("No active tab found or tab ID is undefined.");
        }
      });
    }
  }, 6000);
};


