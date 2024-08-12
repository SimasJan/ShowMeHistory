import mongoose from 'mongoose';
import Result from '../../server/models/Result';

// const MONGODB_URI = 'mongodb://localhost:27017/historic-landmarks';

// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

export async function saveResult(photoUri, apiResults) {
  try {
    const result = new Result({
      photoUri,
      apiResults,
      feedback: null,
    });
    console.log('[saveResult] result', result);
    await result.save();
  } catch (error) {
    console.error('Error saving result:', error);
  }
}

export async function updateFeedback(photoUri, isPositive) {
  try {
    await Result.findOneAndUpdate(
      { photoUri },
      { feedback: isPositive ? 'positive' : 'negative' }
    );
  } catch (error) {
    console.error('Error updating feedback:', error);
  }
}