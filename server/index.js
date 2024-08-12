const express = require('express');
const vision = require('@google-cloud/vision');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
// app config
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = 'mongodb://localhost:27017/employeeManagementApp';
const GOOGLE_APPLICATION_CREDENTIALS = process.env.GOOGLE_APPLICATION_CREDENTIALS || '../creds/historical-vision-app-f84ff7efcad0.json';


const client = new vision.ImageAnnotatorClient(GOOGLE_APPLICATION_CREDENTIALS);
console.log(client);

// connect to database
mongoose
    .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
    }).then(() => {
        console.log('Connected to MongoDB');
    }).catch((err) => {
        console.error('Error connecting to MongoDB', err);
    });


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// define endpoints
app.get('/api/ping', (req, res) => {
  res.send(JSON.stringify({ message: 'pong' }));
});

app.post('/api/analyze-image', async (req, res) => {
  try {
    const { imageUri } = req.body;
    const [result] = await client.landmarkDetection(imageUri);
    console.log('[analyseImage] result: ', result);
    const landmarks = result.landmarkAnnotations;
    res.status(200).json(landmarks);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the image' });
  }
});


const analyzeLandmark = async (photoUri) => {
  try {
    const results = await GoogleVision.requestLandmarkDetectionAsync(photoUri);
    if (results.status !== GoogleVision.GoogleVisionRequestStatus.OK) {
      console.error('Error analyzing image:', results.error);
      return null;
    }
    const landmarks = results.regions[0].landmarks; // Assuming single region
    return landmarks;
  } catch (error) {
    console.error('Error analyzing image:', error);
    return null;
  }
};