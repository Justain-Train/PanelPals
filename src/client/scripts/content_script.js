

let isAudioPlaying = false;
let screenshotInterval = null;
let audio = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "cropImage":
      handleCropImage(request.imageData, sendResponse);
      return true; // Keep the message channel open for sendResponse

    case "sendAudioFinished":
      isAudioPlaying = false;
      startCaptureInterval();
      sendResponse(true);
      break;

    case "startCapture":
      if (screenshotInterval) {
        sendResponse({ success: false, error: "Capture already started" });
      } else {
        startCaptureInterval();
        sendResponse({ success: true });
      }
      break;

    case "stopCapture":
      stopCapture(sendResponse);
      break;

    default:
      sendResponse(false);
  }
  return true; // Keep the message channel open for async responses
});

function handleCropImage(imageData, sendResponse) {
  cropImage(imageData, 50)
    .then((croppedImage) => {
      chrome.runtime.sendMessage(
        { type: "processImage", imageData: croppedImage },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError.message);
            sendResponse(false);
            return;
          }
          if (!response || response.error) {
            console.error("Error:", response ? response.error : "Unknown error");
            sendResponse(false);
          } else {
            isAudioPlaying = true;
            playAudio(response.audioUrl);
            sendResponse(true);
          }
        }
      );
    })
    .catch((error) => {
      console.error("Error cropping image:", error);
      sendResponse(false);
    });
}

function cropImage(imageData, topCrop) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const height = img.height - topCrop;

      canvas.width = img.width;
      canvas.height = height;
      ctx.drawImage(img, 0, topCrop, img.width, height, 0, 0, img.width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (error) => reject(error);
  });
}

function playAudio(audioUrl) {
  if (audio) {
    audio.pause();
    audio = null;
  }

  audio = new Audio(`${audioUrl}?timestamp=${new Date().getTime()}`);
  audio.oncanplaythrough = () => {
    audio.play().catch((error) => console.error("Error playing audio:", error));
  };
  audio.onended = () => {
    chrome.runtime.sendMessage({ type: "audioFinished" });
  };
  audio.onerror = (error) => console.error("Error during audio playback:", error);
}

function startCaptureInterval() {
  if (screenshotInterval) return;

  screenshotInterval = setInterval(() => {
    if (!isAudioPlaying) {
      chrome.runtime.sendMessage({ type: "takeScreenshot" }, (response) => {
        if (response) {
          clearInterval(screenshotInterval);
          screenshotInterval = null;
        } else {
          console.error("Error taking screenshot:", chrome.runtime.lastError);
        }
      });
    }
  }, 1500);
}

function stopCapture(sendResponse) {
  if (audio) {
    audio.pause();
    audio = null;
    isAudioPlaying = false;
  }

  if (screenshotInterval) {
    clearInterval(screenshotInterval);
    screenshotInterval = null;
  }

  sendResponse({ success: true });
}