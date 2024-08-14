import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

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

    generateImageHash: async (uri) => {
        try {
            const fileInfo = await FileSystem.getInfoAsync(uri);
            if (!fileInfo.exists) {
                throw new Error('File does not exist');
            }
            const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            const hash = await Crypto.digestStringAsync(
                Crypto.CryptoDigestAlgorithm.SHA256,
                fileContent
            );
            return hash;
        } catch (error) {
            console.error('Error generating image hash:', error);
            return null;
        }
    },
};