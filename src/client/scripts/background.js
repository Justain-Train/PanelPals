import { detectText, createAudioFileFromText } from "../api/api.js";

let prevText = "";

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
      
      const prevTextnoSpace = prevText.replace(/\s+/g, ' ').trim();
      const textWithoutnewLines= text.replace(/\s+/g, ' ').trim();
      const textToProcess = replaceMatchingSubstringInStr1(textWithoutnewLines, prevTextnoSpace, '""');

      console.log("textToProcess",textToProcess);
      console.log("prevText",prevText);

      if (text) {
        prevText = text;
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
        sendResponse({ noText: "No new text detected" });
      }
    })
    .catch((error) => {
      console.error("Error processing image:", error);
      sendResponse({ error: "Error processing image" });
    });
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

// Function to find the longest common substring between two strings
function findLongestCommonSubstring(str1, str2) {
  const arr = Array(str1.length).fill(null).map(() => Array(str2.length).fill(null));
  let longestSubstringLength = 0;
  let longestSubstring = '';

  for (let i = 0; i < str1.length; i++) {
    for (let j = 0; j < str2.length; j++) {
      if (str1[i] === str2[j]) {
        if (i === 0 || j === 0) {
          arr[i][j] = 1;
        } else {
          arr[i][j] = arr[i - 1][j - 1] + 1;
        }

        if (arr[i][j] > longestSubstringLength) {
          longestSubstringLength = arr[i][j];
          longestSubstring = str1.slice(i - longestSubstringLength + 1, i + 1);
        }
      } else {
        arr[i][j] = 0;
      }
    }
  }

  return longestSubstring;
}

// Function to replace the longest common substring in str1 with a replacement string
function replaceMatchingSubstringInStr1(str1, str2, replacement = '""') {
  const longestCommonSubstring = findLongestCommonSubstring(str1, str2);

  if (longestCommonSubstring.length > 10 ) {
    const regex = new RegExp(longestCommonSubstring, 'g');
    str1 = str1.replace(regex, replacement);
  }
  return str1;
}