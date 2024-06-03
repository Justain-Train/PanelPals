import { ImageAnnotatorClient } from "@google-cloud/vision";
require('dotenv').config();



const client = new ImageAnnotatorClient();

async function detectText(filePath:string){
  try {
    const [result] = await client.textDetection(filePath);
    const detections = result.textAnnotations;
    let fullString = "";

    if (detections) {
      detections.forEach((text : any) => fullString += text.description + " ");
    }
    console.log(fullString.toLowerCase);
  } catch (err) {
    console.error('Error during text detection:', err);
  }
}

detectText("C:/Users/Justin/Pictures/Screenshots/test 2.png")
  .then(()=> console.log("Text detection Completed"))
  .catch(err => console.error("error during text detection", err));