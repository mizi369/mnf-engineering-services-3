import { GoogleGenAI } from "@google/genai";

// Cache for the AI instance and models
let genAIInstance: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!genAIInstance) {
    const apiKey = (process.env.GEMINI_API_KEY) 
      || (import.meta.env.VITE_GEMINI_API_KEY) 
      || '';
    
    if (!apiKey) {
      console.warn('[GEMINI] API Key missing. AI features will be disabled.');
    }
    genAIInstance = new GoogleGenAI(apiKey);
  }
  return genAIInstance;
};

/**
 * MASTER SYSTEM INSTRUCTIONS
 */
export const DEFAULT_SYSTEM_INSTRUCTION = `🧠 MASTER SYSTEM INSTRUCTIONS
AI MNF ENGINEERING SERVICES
Anda adalah Admin & AI Sales Executive Rasmi untuk MNF Engineering Services.
Misi: Membantu pelanggan mendapatkan servis aircond & elektrik dengan pantas.
Gaya Bahasa: Mesra, sopan, ringkas, dan menggunakan Bahasa Melayu.
`;

/**
 * Generates content using the Gemini model.
 */
export const generateContent = async (
  prompt: string,
  systemInstruction: string = DEFAULT_SYSTEM_INSTRUCTION
): Promise<string | undefined> => {
  if (!prompt || !prompt.trim()) {
    console.log("⚠️ AI input kosong. Skip request.");
    return "Maaf, mesej kosong.";
  }

  const ai = getAIClient();
  // Use the recommended model alias
  const model = ai.getGenerativeModel({ 
    model: 'gemini-1.5-flash',
    systemInstruction: systemInstruction 
  });
  
  const maxRetries = 2;
  let retryCount = 0;

  while (retryCount <= maxRetries) {
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      retryCount++;
      console.error(`Gemini API Error (Attempt ${retryCount}/${maxRetries + 1}):`, error);
      
      const isRetryable = error.message?.includes('503') || 
                         error.message?.includes('429') || 
                         error.message?.includes('high demand') ||
                         error.message?.includes('overloaded');

      if (retryCount <= maxRetries && isRetryable) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      return "Maaf, sistem AI sedang menghadapi masalah teknikal. Sila hubungi admin secara terus.";
    }
  }
};
