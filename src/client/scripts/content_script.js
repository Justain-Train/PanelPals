

let isAudioPlaying = false;
let screenshotInterval = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "cropImage") {
    cropImage(request.imageData, 100, 100, 800, 600)
      .then((croppedImage) => {
        sendResponse(true);
        // Send message to background script to process the image  
        chrome.runtime.sendMessage(
          { type: "processImage", imageData: croppedImage },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error sending message:", chrome.runtime.lastError.message);
              return;
            }
            if (response && response.error) {
              console.error("Error:", response.error);
            } else if (response) {
              console.log("Audio URL:", response.audioUrl);
              isAudioPlaying = true;
              clearInterval(screenshotInterval);
              playAudio(response.audioUrl);
            }
          }
        );
      })
      .catch((error) => {
        console.error("Error cropping image:", error);
      });
    return true; // Keep the message channel open for sendResponse
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
  return true; // Keep the message channel open for async responses
});

function cropImage(imageData, x, y, width, height) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (error) => reject(error);
  });
}

function playAudio(audioUrl) {
  const audio = new Audio(audioUrl);
  audio.play();
  audio.onended = () => {
    chrome.runtime.sendMessage({ type: "audioFinished" });
  };
}

const startCaptureInterval = () => {
  if (screenshotInterval) return;

  screenshotInterval = setInterval(() => {
    if (!isAudioPlaying) {
      chrome.runtime.sendMessage({ type: "takeScreenshot" }, (response) => {
        if (!response) {
          console.error("Error taking screenshot:", chrome.runtime.lastError);
        } else {
          console.log("Screenshot taken");
        }
      });
    }
  }, 6000);
};