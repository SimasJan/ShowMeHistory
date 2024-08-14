import axios from 'axios';
import { googleVisionApiKey, searchEngineID } from '../../creds/apiKeys'; // NOTE: same key uses for Vision API and custom search API


const GOOGLE_API_KEY = googleVisionApiKey;
const SEARCH_ENGINE_ID = searchEngineID;

export const searchHistoricPhotos = async (landmarkName) => {
  console.log('Searching for historic photos:', landmarkName);
  try {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: {
        key: GOOGLE_API_KEY,
        cx: SEARCH_ENGINE_ID,
        q: `${landmarkName} historic photo, before`, // TODO: experiment with the query!
        searchType: 'image',
        num: 10,
        imgType: 'photo',
        rights: 'cc_publicdomain|cc_attribute|cc_sharealike',
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
    console.error('Error searching for historic photos:', error);
    throw error;
  }
};