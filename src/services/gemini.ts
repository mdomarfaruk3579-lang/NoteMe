import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const generateMotivationalQuote = async (lang: 'en' | 'bn'): Promise<string> => {
  if (!ai) return lang === 'en' ? 'Stay focused and never give up!' : 'মনোযোগী থাকুন এবং কখনো হাল ছাড়বেন না!';
  
  try {
    const prompt = lang === 'en' 
      ? 'Generate a short, inspiring motivational quote for a productivity app. Just the quote, no quotes around it.'
      : 'একটি প্রোডাক্টিভিটি অ্যাপের জন্য একটি ছোট, অনুপ্রেরণামূলক উক্তি তৈরি করুন বাংলায়। শুধু উক্তিটি দিন, কোনো কোটেশন মার্ক ছাড়া।';
      
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || '';
  } catch (error) {
    console.error('Failed to generate quote', error);
    return lang === 'en' ? 'Stay focused and never give up!' : 'মনোযোগী থাকুন এবং কখনো হাল ছাড়বেন না!';
  }
};

export const improveNoteContent = async (content: string, lang: 'en' | 'bn'): Promise<string> => {
  if (!ai) return content;
  
  try {
    const prompt = lang === 'en'
      ? `Improve the following note content for clarity, grammar, and structure. Keep it concise:\n\n${content}`
      : `নিচের নোটটি আরও স্পষ্ট, ব্যাকরণগতভাবে সঠিক এবং সুন্দর করে গুছিয়ে লিখুন। খুব বড় করবেন না:\n\n${content}`;
      
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text?.trim() || content;
  } catch (error) {
    console.error('Failed to improve note', error);
    return content;
  }
};

export const suggestDailyGoals = async (lang: 'en' | 'bn'): Promise<string[]> => {
  if (!ai) return lang === 'en' ? ['Read 10 pages', 'Exercise 30 mins', 'Drink 2L water'] : ['১০ পৃষ্ঠা বই পড়ুন', '৩০ মিনিট ব্যায়াম করুন', '২ লিটার পানি পান করুন'];
  
  try {
    const prompt = lang === 'en'
      ? 'Suggest 3 simple, actionable daily goals for a productivity app. Return them as a JSON array of strings.'
      : 'একটি প্রোডাক্টিভিটি অ্যাপের জন্য ৩টি সহজ, বাস্তবায়নযোগ্য দৈনিক লক্ষ্যের পরামর্শ দিন। এগুলোকে স্ট্রিংয়ের JSON অ্যারে হিসেবে দিন।';
      
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const text = response.text?.trim() || '[]';
    const goals = JSON.parse(text);
    return Array.isArray(goals) ? goals.slice(0, 3) : [];
  } catch (error) {
    console.error('Failed to suggest goals', error);
    return [];
  }
};
