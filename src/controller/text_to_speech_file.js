"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAudioFileFromText = void 0;
const { ElevenLabsClient } = require('elevenlabs');
const { createWriteStream } = require('fs');
require('dotenv').config();
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const client = new ElevenLabsClient({
    apiKey: ELEVENLABS_API_KEY,
});
const createAudioFileFromText = (text) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const audio = yield client.generate({
                voice: "Callum",
                model_id: "eleven_turbo_v2",
                text,
            });
            const fileName = `output.wav`;
            const fileStream = createWriteStream(fileName);
            audio.pipe(fileStream);
            fileStream.on("finish", () => resolve(fileName)); // Resolve with the fileName
            fileStream.on("error", reject);
        }
        catch (error) {
            reject(error);
        }
    }));
});
exports.createAudioFileFromText = createAudioFileFromText;
