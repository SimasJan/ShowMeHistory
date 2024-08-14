import axios from 'axios';
import { geminiApiKey } from '../../creds/geminiApiKey';

// const MODEL = 'gemini-pro'; // More expensive
const MODEL = 'gemini-1.5-flash';  // 70% cheaper https://ai.google.dev/gemini-api/docs/models/gemini#gemini-1.5-flash
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const generatePrompt = (landmarkName) => {
  return `Provide a brief historical overview and 2-3 interesting facts about ${landmarkName} in 3-5 sentences. Output a standard format text.`;
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

    if (response.data && response.data.candidates && response.data.candidates.length > 0 && response.data.candidates.content > 0) {
      return response.data.candidates.content.parts[0].text;
    } else {
      console.log('No valid response content from Gemini AI');
      return null;
    }
  } catch (error) {
    console.error('Error fetching information from Gemini AI:', error);
    return null;
  }
};