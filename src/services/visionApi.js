const API_URL = 'http://localhost:3000'; // Replace with your server's IP and port

export async function analyzeImage(imageUri) {
  try {
    const response = await fetch(`${API_URL}/analyze-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUri }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const landmarks = await response.json();
    return landmarks;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return null;
  }
}

// import vision from '@google-cloud/vision';

// // You'll need to set up Google Cloud credentials properly
// const client = new vision.ImageAnnotatorClient();

// export async function analyzeImage(imageUri) {
//   try {
//     const [result] = await client.landmarkDetection(imageUri);
//     const landmarks = result.landmarkAnnotations;
//     return landmarks;
//   } catch (error) {
//     console.error('Error analyzing image:', error);
//     return null;
//   }
// }