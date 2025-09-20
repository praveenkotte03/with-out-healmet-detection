import { GoogleGenAI, Type } from "@google/genai";
import type { GeminiViolationResponse } from '../types';

// FIX: Per coding guidelines, the API key must be obtained exclusively from `process.env.API_KEY`.
// This change removes the use of `import.meta.env` and the manual API key check,
// aligning with the assumption that the execution environment is correctly configured.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const model = 'gemini-2.5-flash';

const prompt = `Analyze this image for a traffic violation. Specifically, look for a person riding a motorcycle or scooter without a helmet.
If you find a violation, extract the text from the vehicle's license plate.
Respond ONLY with a JSON object. If no violation is found, 'is_violation' should be false and 'license_plate' should be null.
If a violation is found but the license plate is unreadable, 'license_plate' can be "UNREADABLE".`;

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    is_violation: {
      type: Type.BOOLEAN,
      description: "True if a rider without a helmet is detected, otherwise false."
    },
    license_plate: {
      type: Type.STRING,
      description: "The extracted license plate number. Null if no violation or plate is not readable."
    }
  },
  required: ["is_violation"]
};

export const analyzeFrameForViolation = async (base64Image: string): Promise<GeminiViolationResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText) as GeminiViolationResponse;
    
    return parsedResponse;
    
  } catch (error) {
    console.error("Error analyzing frame with Gemini:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};