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


const client = new vision.ImageAnnotatorClient();

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
app.get('/ping', (req, res) => {
  res.send(JSON.stringify({ message: 'pong' }));
});

app.post('/analyze-image', async (req, res) => {
  try {
    const { imageUri } = req.body;
    const [result] = await client.landmarkDetection(imageUri);
    const landmarks = result.landmarkAnnotations;
    res.status(200).json(landmarks);
  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'An error occurred while analyzing the image' });
  }
});