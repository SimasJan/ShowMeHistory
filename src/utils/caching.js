import AsyncStorage from '@react-native-async-storage/async-storage';


export const setCachedResult = async (hash, data) => {
    console.log('Setting cached result for hash:', hash);
    try {
      const cacheData = {
        ...data,
        timestamp: Date.now(),
      };
      // console.log('Caching data for hash:', hash);
      await AsyncStorage.setItem(`@ImageAnalysis_${hash}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
};
  
export const getCachedResult = async (hash) => {
    console.log('Getting cached result for hash:', hash);
    try {
      const cachedData = await AsyncStorage.getItem(`@ImageAnalysis_${hash}`);
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        console.log('Found cached data for hash:', hash);
        return parsedData;
        // Check if the cached data is not older than 24 hours
        // if (Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
        //   return parsedData;
        // } else {
        //   console.log('Cached data is older than 24 hours, will reanalyze');
        // }
      }
      return null;
    } catch (error) {
      console.error('Error reading cached data:', error);
      return null;
    }
};
