import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { googleVisionApiKey } from '../../creds/apiKey';

function ResultsScreen({ route }) {
  const { photo } = route.params;
  const [landmark, setLandmark] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    analyzeImage();
  }, []);

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
            features: [{ type: 'LANDMARK_DETECTION', maxResults: 1 }]
          }
        ],
      };

      const apiResponse = await axios.post(apiUrl, requestData, {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        }
      });

      const landmarkAnnotations = apiResponse.data.responses[0].landmarkAnnotations;

      if (landmarkAnnotations && landmarkAnnotations.length > 0) {
        setLandmark({
          name: landmarkAnnotations[0].description,
          country: landmarkAnnotations[0].locations[0].latLng.latitude > 0 ? 'Northern Hemisphere' : 'Southern Hemisphere',
          confidence: landmarkAnnotations[0].score
        });
      } else {
        setError('No landmark detected in the image.');
      }
    } catch (error) {
      console.error('Error analyzing image: ', error);
      setError('Error analyzing image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.image} />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : landmark ? (
        <View style={styles.resultContainer}>
          <Text style={styles.landmarkName}>{landmark.name}</Text>
          <Text style={styles.landmarkCountry}>{landmark.country}</Text>
          <Text style={styles.confidence}>Confidence: {(landmark.confidence * 100).toFixed(2)}%</Text>
        </View>
      ) : (
        <Text style={styles.noResultText}>No landmark information available.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: '100%',
    height: '80%',
    // width: 300,
    // height: 300,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  resultContainer: {
    alignItems: 'center',
  },
  landmarkName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  landmarkCountry: {
    fontSize: 18,
    marginBottom: 10,
  },
  confidence: {
    fontSize: 16,
    color: 'gray',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noResultText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ResultsScreen;