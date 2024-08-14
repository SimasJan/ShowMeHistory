import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { geminiApiKey, geminiAPIEndpoint, geminiModel } from '../../creds/geminiApiKey'; // TODO: replace to env. // import { googleVisionApiKey } from '@env';
import { googleVisionApiKey } from '../../creds/apiKey';
import { searchEngineID } from '../../creds/searchEngine';

const generatePrompt = (landmarkName) => {
    return `Provide a brief historical overview and 2-3 interesting facts about ${landmarkName} in 3-5 sentences. Output a standard format text.`;
};

const cleanTitle = (title) => {
    // Remove common prefixes
    title = title.replace(/^(File:|Image:|Free Images: )/, '').trim();
    
    // Remove file extensions
    title = title.replace(/\.(jpg|jpeg|png|gif)$/i, '').trim();
    
    // Remove common suffixes
    title = title.replace(/- Wikimedia Commons$/, '').trim();
    
    // Remove text after | or - if it contains common words
    title = title.replace(/[\||-].*?(flickr|commons|wikimedia).*$/i, '').trim();
    
    // Capitalize first letter of each word
    title = title.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    
    return title;
  };

export const ApiService = {
  analyzeImage: async (uri) => {
    const base64Image = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`;
    const requestData = {
      requests: [
        {
          image: { content: base64Image },
          features: [
            { type: 'LANDMARK_DETECTION', maxResults: 3 },
            { type: 'WEB_DETECTION', maxResults: 4 }
          ]
        }
      ],
    };

    try {
      const response = await axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      });
      return response.data.responses[0];
    } catch (error) {
      console.error('Error analyzing image:');
      throw error;
    }
  },

  getGeminiInfo: async (landmarkName) => {
    try {
        const prompt = generatePrompt(landmarkName);
        console.log('Prompt:', prompt);
        const response = await axios.post(
          `${GEMINI_API_ENDPOINT}?key=${geminiApiKey}`,
          {
            contents: [{ parts: [{ text: prompt }] }]
          }
        );
        if (response.data && response.data.candidates && response.data.candidates.length > 0 && response.data.candidates.content > 0) {
          return response.data.candidates.content.parts[0].text;
        } else {
          console.log('No valid response content from Gemini AI');
          return null;
        }
      } catch (error) {
        console.error('Error fetching information from Gemini AI:');
        return null;
      }
    // TODO: use or del?>> return { summary: 'Placeholder summary for ' + landmarkName };
  },

  searchHistoricPhotos: async (landmarkName) => {
    console.log('Searching for historic photos:');
    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
            key: googleVisionApiKey,
            cx: searchEngineID,
            q: `${landmarkName} historic photo, before`, // TODO: experiment with the query!
            searchType: 'image',
            num: 10,
            imgType: 'photo',
            rights: 'cc_publicdomain|cc_attribute|cc_sharealike',
        },
        });

        if (response.data.items && response.data.items.length > 0) {
        return response.data.items.map(item => ({
            url: item.link,
            thumbnail: item.image.thumbnailLink,
            title: cleanTitle(item.title),
            contextLink: item.image.contextLink,
        }));
        } else {
        throw new Error('No historic photos found');
        }
    } catch (error) {
        console.error('Error searching for historic photos:');
        throw error;
    }
    // return [{ title: 'Historic photo of ' + landmarkName, url: 'https://example.com/photo.jpg' }];
    },
};