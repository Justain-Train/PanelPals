const express = require('express');
const router = express.Router();
const { detectText } = require('../controllers/textController')
const multer = require('multer');
const upload = multer();

router.post('/detect-text', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("Image is required");
  }

  try {
    const imageData = req.file.buffer.toString('base64');

    console.error("imageData",imageData);

    const detectedText = await detectText(imageData);
    res.status(200).send(detectedText);
  } catch(error) {
    console.error('Error detecting text (express.js):', error);
    res.status(500).send("Error detecting text");
  }
});

module.exports = router;