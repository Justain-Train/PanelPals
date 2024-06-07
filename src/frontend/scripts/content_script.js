
  console.log("hello")


  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "takeScreenshot") {
      
      chrome.tabs.captureVisibleTab(null, { format: "png" }, (imageData) => {
        if (chrome.runtime.lastError) {
          console.error(
            "Error capturing visible tab:",
            chrome.runtime.lastError
          );
          return;
        }

        cropImage(imageData, 100, 100, 800, 600)
          .then((croppedImage) => {
            // Send message to background script
            chrome.runtime.sendMessage(
              { type: "processImage", imageData: croppedImage },
              (response) => {
                if (chrome.runtime.lastError) {
                  console.error(
                    "Error sending message:",
                    chrome.runtime.lastError.message
                  );
                  return;
                }
                if (
                  !chrome.runtime.lastError &&
                  chrome.runtime.lastError.message ===
                    "The message port closed before a response was received."
                ) {
                  console.error(
                    "Message port closed before a response was received"
                  );
                  return;
                }
                if (response && response.error) {
                  console.error("Error:", response.error);
                } else if (response) {
                  playAudio(response.audioUrl);
                }
              }
            );
          })
          .catch((error) => {
            console.error("Error cropping image:", error);
          });
      });
    }
    return true;
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

