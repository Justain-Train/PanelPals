const express = require('express');
const router = express.Router();
const { detectText } = require('../controllers/textController')

router.post('/detect-text', async (req,res) => {
const { image } = req.body
  if (!image) {
    return res.status(400).send("Image is required");
  }

  try {
    const detectedText = await detectText(image);
    res.status(200).send(detectedText);
  } catch(error) {
    console.error('Error detecting text:', error);
    res.status(500).send("Error detecting text");
  }
});

module.exports = router;