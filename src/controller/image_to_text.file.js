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
const vision_1 = require("@google-cloud/vision");
require('dotenv').config();
const client = new vision_1.ImageAnnotatorClient();
function detectText(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [result] = yield client.textDetection(filePath);
            const detections = result.textAnnotations;
            let fullString = "";
            if (detections) {
                detections.forEach((text) => fullString += text.description + " ");
            }
            console.log(fullString.toLowerCase());
        }
        catch (err) {
            console.error('Error during text detection:', err);
        }
    });
}
detectText("C:/Users/Justin/Pictures/Screenshots/test5.png")
    .then(() => console.log("Text detection Completed"))
    .catch(err => console.error("error during text detection", err));
