import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";

export const AiService = {
  rephrase: async (text: string, tone: string = "appetizing") => {
    const apiKey = env.geminiApiKey || process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment, using offline rephrase fallback.");
      return mockRephrase(text, tone);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `You are a professional copywriter for a premium food delivery service named FoodExpress. 
Your task is to rephrase the following text to sound extremely ${tone}, appealing, and high-quality.
Keep it natural, clean, and engaging.
Limit your response to a single, concise paragraph of max 250 characters. Do not include markdown formatting or quotation marks.

Original text:
${text}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const enhancedText = response.text();
      return enhancedText.trim().replace(/^["']|["']$/g, "");
    } catch (error) {
      console.error("Gemini AI API call failed, falling back to mock rephrase:", error);
      return mockRephrase(text, tone);
    }
  }
};

function mockRephrase(text: string, tone: string): string {
  const cleanText = text.trim();
  if (!cleanText) return "";
  
  const appetizers = [
    "Indulge in our mouth-watering",
    "Savor the exquisite flavors of our freshly prepared",
    "Treat yourself to our signature",
    "Experience pure culinary delight with our premium",
    "Enjoy the rich, authentic taste of our delicious"
  ];
  
  const descriptives = [
    "expertly crafted using select, farm-fresh ingredients for an unforgettable flavor experience.",
    "cooked to golden perfection and seasoned with a unique blend of aromatic spices.",
    "a chef-inspired masterpiece that is perfect for sharing or enjoying all to yourself.",
    "delivered hot and fresh, showcasing premium quality in every bite."
  ];

  const templateIdx1 = cleanText.length % appetizers.length;
  const templateIdx2 = (cleanText.length + 3) % descriptives.length;

  const prefix = appetizers[templateIdx1];
  const suffix = descriptives[templateIdx2];

  if (cleanText.includes(".") || cleanText.length > 50) {
    return `✨ [Enhanced] ${prefix} selection: ${cleanText} - all crafted with premium ingredients for the perfect meal experience.`;
  }
  
  return `${prefix} ${cleanText}, ${suffix}`;
}
