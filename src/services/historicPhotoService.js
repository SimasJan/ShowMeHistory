import axios from 'axios';
import { searchEngineID } from '../../creds/searchEngine';
import { googleVisionApiKey } from '../../creds/apiKey'; // NOTE: same key uses for Vision API and custom search API


const GOOGLE_API_KEY = googleVisionApiKey;
const SEARCH_ENGINE_ID = searchEngineID;

export const searchHistoricPhotos = async (landmarkName) => {
    console.log('Searching for historic photos:', landmarkName);
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: `${landmarkName} historic photo`,
        searchType: 'image',
        num: 10,
        imgType: 'photo',
        rights: 'cc_publicdomain|cc_attribute|cc_sharealike',
      },
    });
    console.log('=> Search Results:', response.data.items);

    if (response.data.items && response.data.items.length > 0) {
      return response.data.items.map(item => ({
        url: item.link,
        thumbnail: item.image.thumbnailLink,
        title: item.title,
        contextLink: item.image.contextLink,
      }));
    } else {
      throw new Error('No historic photos found');
    }
  } catch (error) {
    console.error('Error searching for historic photos:', error);
    throw error;
  }
};