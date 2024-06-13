import { detectText, createAudioFileFromText } from "../api/api.js";

let processedText = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case "processImage":
      processImage(request.imageData, sendResponse);
      return true;

    case "takeScreenshot":
      takeScreenshot(sendResponse);
      return true;

    case "audioFinished":
      handleAudioFinished();
      return true;

    default:
      return false;
  }
});

function processImage(imageData, sendResponse) {
  const base64 = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
  const imageBlob = base64ToBlob(base64, "image/png");
  const formData = new FormData();
  formData.append("image", imageBlob, "screenshot.png");

  detectText(formData)
    .then((text) => {
      let textToProcess = removeProcessedText(text);
      if (textToProcess.trim()) {
        processedText.push(textToProcess);
        createAudioFileFromText(textToProcess)
          .then((blob) => {
       
              const audioUrl = chrome.runtime.getURL("output.wav");
              sendResponse({ audioUrl });
      
          })
          .catch((error) => {
            console.error("Error creating audio file:", error);
            sendResponse({ error: "Error creating audio file" });
          });
      } else {
        sendResponse({ error: "No new text detected" });
      }
    })
    .catch((error) => {
      console.error("Error processing image:", error);
      sendResponse({ error: "Error processing image" });
    });
}

function removeProcessedText(text) {
  processedText.forEach((processed) => {
    text = text.replace(processed, "");
  });
  return text;
}

function takeScreenshot(sendResponse) {
  chrome.tabs.captureVisibleTab(null, { format: "png" }, (imageData) => {
    if (chrome.runtime.lastError) {
      console.error("Error capturing visible tab:", chrome.runtime.lastError);
      sendResponse(false);
      return;
    }

    sendResponse(true);
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "cropImage", imageData });
      }
    });
  });
}

function handleAudioFinished() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "sendAudioFinished" });
    }
  });
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: mimeType });
}