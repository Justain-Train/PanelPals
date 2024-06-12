import { detectText } from "../api/api.js";
import { createAudioFileFromText } from "../api/api.js";

let prevText = ""; 
let processedText = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "processImage") {
    console.log("Cropped Image", request.imageData);

    const croppedImage = request.imageData;
    const base64 = croppedImage.replace(/^data:image\/[a-z]+;base64,/, "");
    const imageBlob = base64ToBlob(base64, "image/png");
    const formData = new FormData();
    formData.append("image", imageBlob, "screenshot.png");

    detectText(formData)
      .then((text) => {
       let textToProcess = text;
        processedText.forEach((processedText) => {
          textToProcess = textToProcess.replace(processedText, "");
        });

        if (textToProcess.trim()) {
          prevText = text;
          processedText.push(text);
          console.log("Text to Process", textToProcess)

          if (!textToProcess) {
            sendResponse({ error: "No new text detected" });
            return;
          } else {
            createAudioFileFromText(textToProcess).then((blob) => {
              const audioUrl = chrome.runtime.getURL("output.wav");
              sendResponse({ audioUrl });
            }).catch((error) => {
              console.error("There was an error creating audio file", error);
              sendResponse({ error: "There was an error creating audio file" });
            })
         }
    
        } else {
          sendResponse({error: "No new text detected"});
        }
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
          chrome.tabs.sendMessage(
            tabs[0].id,
            {
              type: "cropImage",
              imageData,
            },
            (response) => {
              if (!response) {
                console.error(
                  "Failed to send message:",
                  chrome.runtime.lastError.message
                );
              } else {
                console.log("Crop Image message sent successfully!");
              }
            }
          );
        }
      });
    });
    return true;
  } else if (request.type === "audioFinished"){
    console.log("Audio finished");
    chrome.tabs.query({active : true, currentWindow: true}, (tabs) => {
      if (tabs.length && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, {type: "sendAudioFinished"}, (response) => {
          if (!response) {
            console.log("Failed to send message:", chrome.runtime.lastError.message);
            return;
          } else {
            console.log("Audio Finished message sent successfully!");
          }
        });
      }
    })
    
    return true;
  }
  return true;
});


function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: mimeType });
  return blob;
}