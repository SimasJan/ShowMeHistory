import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const CachingService = {
  setItem: async (key, data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  },

  getItem: async (key) => {
    try {
      const cachedData = await AsyncStorage.getItem(key);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.error('Error reading cached data:', error);
      return null;
    }
  },

  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  },

  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  },
};

// import AsyncStorage from '@react-native-async-storage/async-storage';


// export const setCachedResult = async (hash, data) => {
//     console.log('Setting cached result for hash:', hash);
//     try {
//       const cacheData = {
//         ...data,
//         timestamp: Date.now(),
//       };
//       // console.log('Caching data for hash:', hash);
//       await AsyncStorage.setItem(`@ImageAnalysis_${hash}`, JSON.stringify(cacheData));
//     } catch (error) {
//       console.error('Error caching data:', error);
//     }
// };
  
// export const getCachedResult = async (hash) => {
//     console.log('Getting cached result for hash:', hash);
//     try {
//       const cachedData = await AsyncStorage.getItem(`@ImageAnalysis_${hash}`);
//       if (cachedData) {
//         const parsedData = JSON.parse(cachedData);
//         console.log('Found cached data for hash:', hash);
//         return parsedData;
//         // Check if the cached data is not older than 24 hours
//         // if (Date.now() - parsedData.timestamp < 24 * 60 * 60 * 1000) {
//         //   return parsedData;
//         // } else {
//         //   console.log('Cached data is older than 24 hours, will reanalyze');
//         // }
//       }
//       return null;
//     } catch (error) {
//       console.error('Error reading cached data:', error);
//       return null;
//     }
// };
