import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

export async function generateImageHash(uri) {
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
}