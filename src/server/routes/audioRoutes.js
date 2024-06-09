
const express = require('express');
const router =  express.Router();
const { createAudioFileFromText } = require('../controllers/audioController');


router.post('/generate-audio' , async (req,res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).send("Text is required");
  }
  
  try {
     await createAudioFileFromText(text).then((fileName) => {
      res.status(200).sendFile(fileName, { root: './' });
    });
  } catch(error) {
    console.error('Error generating audio file:', error);
    res.status(500).send("Error generating audio file");
  }

});

module.exports = router;