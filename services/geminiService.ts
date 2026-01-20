
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSessionTheme = async (
  title: string, 
  location: string, 
  photographer: string, 
  model: string
) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Propon un concepto creativo breve (3 frases) para una sesión de fotos titulada "${title}" en "${location}". Involucra al fotógrafo ${photographer} y a la modelo ${model}. Estilo minimalista y profesional.`,
      config: {
        temperature: 0.7,
        maxOutputTokens: 200,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error generando concepto. Por favor, escribe manualmente.";
  }
};
