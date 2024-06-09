const { ElevenLabsClient } = require('elevenlabs');
const { createWriteStream } = require('fs');
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

const createAudioFileFromText = async (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const audio = await client.generate({
        voice: "Callum",
        model_id: "eleven_turbo_v2",
        text,
      });
      const fileName = `output.wav`;
      const fileStream = createWriteStream(fileName);

      audio.pipe(fileStream);
      fileStream.on("finish", () => resolve(fileName)); // Resolve with the fileName
      fileStream.on("error", reject);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { createAudioFileFromText };





