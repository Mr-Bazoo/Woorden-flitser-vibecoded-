import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

export const generateWordList = async (topic: string, count: number = 10): Promise<string[]> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning fallback data.");
    return ['vis', 'aap', 'noot', 'mies', 'vuur'];
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genereer een lijst van ${count} Nederlandse woorden die te maken hebben met het thema "${topic}". De woorden moeten geschikt zijn voor basisschoolleerlingen (groep 3-8).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    const words = JSON.parse(text);
    return Array.isArray(words) ? words : [];
  } catch (error) {
    console.error("Error generating word list:", error);
    throw new Error("Kon geen woorden genereren. Probeer het opnieuw of voer ze handmatig in.");
  }
};