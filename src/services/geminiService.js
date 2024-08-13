import axios from 'axios';
import { geminiApiKey } from '../../creds/geminiApiKey';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const generatePrompt = (landmarkName) => {
  return `Provide a brief historical overview and 2-3 interesting facts about ${landmarkName} in 3-5 sentences. Always complete sentences! Always provide output in a readable format do not use markdown formating!`;
};

export const getGeminiInfo = async (landmarkName) => {
  try {
    const prompt = generatePrompt(landmarkName);
    console.log('Prompt:', prompt);
    const response = await axios.post(
      `${GEMINI_API_ENDPOINT}?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    console.log('Response:', response.data);

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        return candidate.content.parts[0].text;
      } else {
        console.log('No valid response content from Gemini AI');
        return null;
      }
    } else {
      console.log('No valid candidates in Gemini AI response');
      return null;
    }
  } catch (error) {
    console.error('Error fetching information from Gemini AI:', error);
    return null;
  }
};