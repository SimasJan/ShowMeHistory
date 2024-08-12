import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { googleVisionApiKey } from '../../creds/apiKey';
import { Ionicons } from '@expo/vector-icons';

function ResultsScreen({ route }) {
  const [photo, setPhoto] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [webEntities, setWebEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    console.log('Route params:', route.params);
    if (route.params && route.params.photo) {
      setPhoto(route.params.photo);
    } else {
      setError('No photo provided');
      setLoading(false);
    }
  }, [route.params]);

  useEffect(() => {
    if (photo) {
      analyzeImage();
    }
  }, [photo]);

  const analyzeImage = async () => {
    try {
      setLoading(true);
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${googleVisionApiKey}`;

      const base64Image = await FileSystem.readAsStringAsync(photo.uri, { 
        encoding: FileSystem.EncodingType.Base64
      });

      const requestData = {
        requests: [
          {
            image: { content: base64Image },
            features: [
              { type: 'LANDMARK_DETECTION', maxResults: 3 },
              { type: 'WEB_DETECTION', maxResults: 3 }
            ]
          }
        ],
      };

      const apiResponse = await axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      });
      console.log('apiResponse.data.responses:\n', apiResponse.data.responses);

      const { landmarkAnnotations, webDetection } = apiResponse.data.responses[0];

      if (landmarkAnnotations && landmarkAnnotations.length > 0) {
        setLandmarks(landmarkAnnotations.map(landmark => ({
          name: landmark.description,
          country: landmark.locations[0].latLng.latitude > 0 ? 'Northern Hemisphere' : 'Southern Hemisphere',
          confidence: landmark.score
        })));
      }

      if (webDetection && webDetection.webEntities && webDetection.webEntities.length > 0) {
        setWebEntities(webDetection.webEntities.slice(0, 3));
      }

      if (!landmarkAnnotations && !webDetection) {
        setError('No information detected in the image.');
      }
    } catch (error) {
      console.error('Error analyzing image: ', error);
      setError('Error analyzing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (isPositive) => {
    setFeedback(isPositive);
    // Here you would typically send this feedback to your backend
    console.log(`User feedback: ${isPositive ? 'Positive' : 'Negative'}`);
  };

  if (!photo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Loading...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.image} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.resultContainer}>
          {landmarks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Landmarks Detected</Text>
              {landmarks.map((landmark, index) => (
                <View key={index} style={styles.landmarkItem}>
                  <Text style={styles.landmarkName}>{landmark.name}</Text>
                  <Text style={styles.landmarkCountry}>{landmark.country}</Text>
                  <Text style={styles.confidence}>Confidence: {(landmark.confidence * 100).toFixed(2)}%</Text>
                </View>
              ))}
            </View>
          )}
          {webEntities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Web Entities</Text>
              {webEntities.map((entity, index) => (
                <Text key={index} style={styles.webEntity}>{entity.description}</Text>
              ))}
            </View>
          )}
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackQuestion}>Was this information helpful?</Text>
            <View style={styles.feedbackButtons}>
              <TouchableOpacity onPress={() => handleFeedback(true)} style={[styles.feedbackButton, feedback === true && styles.selectedFeedback]}>
                <Ionicons name="thumbs-up" size={24} color={feedback === true ? "white" : "black"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleFeedback(false)} style={[styles.feedbackButton, feedback === false && styles.selectedFeedback]}>
                <Ionicons name="thumbs-down" size={24} color={feedback === false ? "white" : "black"} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  resultContainer: {
    width: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  landmarkItem: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  landmarkName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  landmarkCountry: {
    fontSize: 16,
    color: '#555',
  },
  confidence: {
    fontSize: 14,
    color: '#777',
  },
  webEntity: {
    fontSize: 16,
    marginBottom: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  feedbackQuestion: {
    fontSize: 18,
    marginBottom: 10,
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  feedbackButton: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  selectedFeedback: {
    backgroundColor: '#007AFF',
  },
});

export default ResultsScreen;