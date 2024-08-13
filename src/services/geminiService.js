import axios from 'axios';
import { geminiApiKey } from '../../creds/geminiApiKey';

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

const generatePrompt = (landmarkName) => {
  return `Provide a brief historical overview and 2-3 interesting facts about ${landmarkName} in 3-5 sentences.`;
};

export const getGeminiInfo = async (landmarkName) => {
  try {
    const prompt = generatePrompt(landmarkName);
    const response = await axios.post(
      `${GEMINI_API_ENDPOINT}?key=${geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      return response.data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('No valid response from Gemini AI');
    }
  } catch (error) {
    console.error('Error fetching information from Gemini AI:', error);
    throw error;
  }
};