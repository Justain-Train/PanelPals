import {detectText} from "../api/api.js";
import {createAudioFileFromText} from "../api/api.js";


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "processImage") {
    detectText(request.imageData)
      .then((text) => createAudioFileFromText(text))
      .then((audioUrl) => {
        console.log("Audio URL:", audioUrl);
        sendResponse({ audioUrl });
      })
      .catch((error) => {
        console.error("There was an error Processing Image", error);
        sendResponse({ error: "There was an error Processing Image" });
      });
    return true; 
  } else if (request.type === "takeScreenshot") {
    
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (imageData) => {

      if (chrome.runtime.lastError) {
        console.error("Error capturing visible tab:", chrome.runtime.lastError);
        sendResponse(false);
        return;
      }
      console.log("Captured visible tab:", imageData);

      

      sendResponse(true);
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "cropImage",
            imageData
          }, (response) => {
            if (!response) {
              console.error("Failed to send message:", chrome.runtime.lastError.message);
            } else {
              console.log("Crop Image message sent successfully!");
  
            }
          });
        }
      });
    });
    return true; 
  }
  return true; 
});






