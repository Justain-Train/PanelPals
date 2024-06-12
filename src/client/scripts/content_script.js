

let isAudioPlaying = false;
let screenshotInterval = null;
let audio = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "cropImage") {
    cropImage(request.imageData, 50)
      .then((croppedImage) => {
        // Send message to background script to process the image
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
              console.log("Received", response.audioUrl);
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
    return true; // Keep the message channel open for sendResponse
  } else if (request.type === "sendAudioFinished") {
    isAudioPlaying = false;
    sendResponse(true);
    startCaptureInterval();
  } else if (request.type === "startCapture") {
    if (screenshotInterval) {
      sendResponse({ success: false, error: "Capture already started" });
      return;
    } else {
      startCaptureInterval();
      sendResponse({ success: true });
    }
  } else if (request.type === "stopCapture") {
    if (!screenshotInterval) {
      sendResponse({ success: false, error: "Capture not started" });
      return;
    } else {
      clearInterval(screenshotInterval);
      screenshotInterval = null;
      sendResponse({ success: true });
    }
  }
  return true; // Keep the message channel open for async responses
});

function cropImage(imageData, topCrop) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageData;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const cropY = topCrop;
      const width = img.width;
      const height = img.height - cropY;

      canvas.width = img.width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, cropY, width, height, 0, 0, width, height);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = (error) => reject(error);
  });
}

function playAudio(audioUrl) {
  console.log("Playing audio:", audioUrl);

  
  if (audio) {
    audio.pause();
    audio = null;
  }

   audio = new Audio();

  const uniqueAudioUrl = `${audioUrl}?timestamp=${new Date().getTime()}`;
  audio.src = uniqueAudioUrl;

  audio.oncanplaythrough = () => {
    console.log("Audio can play through.");
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  audio.onplay = () => {
    console.log("Audio started playing.");
  };

  audio.onended = () => {
    console.log("Audio ended.");
    chrome.runtime.sendMessage({ type: "audioFinished" });
  };

  audio.onerror = (error) => {
    console.error("Error during audio playback:", error);
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
          clearInterval(screenshotInterval);
          screenshotInterval = null;
          console.log("Screenshot taken");
        }
      });
    }
  }, 1500);
};


