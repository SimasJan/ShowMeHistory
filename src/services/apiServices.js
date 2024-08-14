import axios from 'axios';
// import { googleVisionApiKey, searchEngineID, geminiApiKey } from '../../creds/apiKeys';
import { handleErrorMessage, cleanTitle, generatePrompt } from '../utils/utils';
import { Configuration } from '../../config/config';

export const ApiService = {
    objectDetection: async (base64Image) => {

        const apiUrl = `${Configuration.Urls.googleVision}?key=${Configuration.ApiKeys.googleVisionApiKey}`;
        const requestData = {
            requests: [
                {
                    image: { content: base64Image },
                    features: [Configuration.DetectionFeatures],
                }
            ],
        };
  
        try {
            const response = await axios.post(apiUrl, requestData, { headers: {'Content-Type': 'application/json; charset=utf-8'} });
            return response.data.responses[0];
        } catch (error) {
            console.error('Error analyzing image:', handleErrorMessage(error.message));
            throw error;
        }
    },
  
    getGeminiInfo: async (landmarkName) => {
        try {
            const prompt = generatePrompt(landmarkName);
            console.log('Prompt:', prompt);
            const response = await axios.post(`${Configuration.Urls.generateContent}?key=${Configuration.ApiKeys.geminiApiKey}`,
                { contents: [{ parts: [{ text: prompt }] }] }
            );
            console.log('getGeminiInfo.response: ', response.data.candidates[0].content.parts[0].text);

            if (response.data && response.data.candidates && response.data.candidates.length > 0) {
                return response.data.candidates[0].content.parts[0].text 
            } else {
              console.log('No valid response content from Gemini AI', response.data);
              return null;
            }
          } catch (error) {
            console.error('Error fetching information from Gemini AI:', error.message);
            return null;
          }
        // TODO: use or del?>> return { summary: 'Placeholder summary for ' + landmarkName };
    },
  
    searchHistoricPhotos: async (landmarkName) => {
        console.log('Searching historic photos for:', landmarkName);
        try {
            const response = await axios.get(Configuration.Urls.searchHistoricPhotos, {
            params: {
                key: Configuration.ApiKeys.googleVisionApiKey,
                cx: Configuration.ApiKeys.searchEngineID,
                q: `${landmarkName} ${Configuration.SearchHistoricPhotosParams.query}`,
                searchType: Configuration.SearchHistoricPhotosParams.searchType,
                num: Configuration.SearchHistoricPhotosParams.maxResults,
                imgType: Configuration.SearchHistoricPhotosParams.imgType,
                rights: Configuration.SearchHistoricPhotosParams.rights,
            },
            });
            console.log('searchHistoricPhotos results found: ', response.data.items.length);

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
            console.error('Error searching for historic photos:', handleErrorMessage(error));
            throw error;
        }
    },
  };