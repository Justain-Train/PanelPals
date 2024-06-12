const { ImageAnnotatorClient } = require('@google-cloud/vision');
require('dotenv').config();

const client = new ImageAnnotatorClient();

const detectText = async (base64Image) => {
  try {
    const [result] = await client.textDetection({
      image: { content: base64Image },
    });
    const detections = result.fullTextAnnotation;
    return detections.text;
  } catch (err) {
    console.error('Error during text detection:', err);
    throw err; // Rethrow the error to handle it elsewhere if needed
  }
};

module.exports = { detectText };