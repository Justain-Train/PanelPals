import { createAudioFileFromText } from "./text_to_speech_file";

createAudioFileFromText("Hello my name is Suho Kim.")
  .then((fileName) => {
    console.log(`Audio file created: ${fileName}`);
  })
  .catch((error) => {
    console.error(`Error creating audio file: ${error}`);
  });











