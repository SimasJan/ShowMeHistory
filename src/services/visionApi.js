import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const API_URL = 'http://192.168.143.208:3000'; // Replace with your server's IP and port

export async function analyzeImage(imageUri) {
  console.log('[visionApi] imageUri', imageUri);
  try {
    // convert image to base64
    const base64Image = await FileSystem.readAsStringAsync(imageUri, { encoding: FileSystem.EncodingType.Base64 });

    const response = await axios.post(`${API_URL}/api/analyze-image`, { image: base64Image }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('[visionApi] response', response);

    if (response.status !== 200) {
      throw new Error('Network response was not ok');
    }

    const landmarks = await response.data;
    return landmarks;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return null;
  }
}
