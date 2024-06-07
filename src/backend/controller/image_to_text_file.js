import { ImageAnnotatorClient } from "@google-cloud/vision";
require('dotenv').config();



const client = new ImageAnnotatorClient();

export const detectText = async (filePath) => {
  try {
    const [result] = await client.textDetection(filePath);
    const detections = result.fullTextAnnotation;

    return detections.text;
  } catch (err) {
    console.error('Error during text detection:', err);
  }
}


