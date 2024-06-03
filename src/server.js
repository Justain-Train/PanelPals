const { createAudioFileFromText } = require('./controller/text_to_speech_file')




createAudioFileFromText("bang people are willing to do whatever they must .  ")
  .then((fileName) => {
    console.log(`Audio file created: ${fileName}`);
  })
  .catch((error) => {
    console.error(`Error creating audio file: ${error}`);
  });











