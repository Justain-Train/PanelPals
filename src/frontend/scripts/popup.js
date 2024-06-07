
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");
const statusDiv = document.getElementById("status");

startButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({type: "startCapture"}, (response) => {
    if (!response.success) {
      console.error('Error starting capture:', chrome.runtime.lastError.message);
    } else {
      statusDiv.textContent = "Capture started!";
    }
  }); 
});

stopButton.addEventListener("click", () => {
  chrome.runtime.sendMessage({type: "stopCapture"}, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error stopping capture:', chrome.runtime.lastError.message);
    } else {
      statusDiv.textContent = "Capture stopped!";
    }
  });
});




