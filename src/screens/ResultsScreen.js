import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, Linking } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { googleVisionApiKey } from '../../creds/apiKey';
import { Ionicons } from '@expo/vector-icons';
import { searchHistoricPhotos } from '../services/historicPhotoService';
import Carousel from 'react-native-snap-carousel';

const { width: screenWidth } = Dimensions.get('window');

function ResultsScreen({ route }) {
  const [photo, setPhoto] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [webEntities, setWebEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [historicPhotos, setHistoricPhotos] = useState([]);
  const [historicPhotosLoading, setHistoricPhotosLoading] = useState(true);
  const [historicPhotosError, setHistoricPhotosError] = useState(null);
  const carouselRef = useRef(null);

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

  useEffect(() => {
    if (landmarks.length > 0) {
      console.log('Fetching historic photos for:', landmarks[0].name);
      fetchHistoricPhotos(landmarks[0].name);
    }
  }, [landmarks]);

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
        const detectedLandmarks = landmarkAnnotations.map(landmark => ({
            name: landmark.description,
            country: landmark.locations[0].latLng.latitude > 0 ? 'Northern Hemisphere' : 'Southern Hemisphere',
            confidence: landmark.score
        }));
        console.log('Detected landmarks:', detectedLandmarks);
        setLandmarks(detectedLandmarks);
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

  const fetchHistoricPhotos = async (landmarkName) => {
    setHistoricPhotosLoading(true);
    try {
      const photos = await searchHistoricPhotos(landmarkName);
      setHistoricPhotos(photos);
      console.log('Historic photos Set:', photos);
    } catch (error) {
      console.error('Error fetching historic photos:', error);
      setHistoricPhotosError(error);
    } finally {
      setHistoricPhotosLoading(false);
    }
  };

  const handleFeedback = (isPositive) => {
    setFeedback(isPositive);
    // Here you would typically send this feedback to your backend
    console.log(`User feedback: ${isPositive ? 'Positive' : 'Negative'}`);
  };

  const handleSeeMore = (landmarkName) => {
    const query = `${landmarkName} historic photo`;
    const url = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    Linking.openURL(url);
  };

  const renderHistoricPhoto = ({ item }) => {
    if (!item || !item.thumbnail) return null;
    return (
      <View style={styles.carouselItem}>
        <Image source={{ uri: item.thumbnail }} style={styles.carouselImage} />
        <View style={styles.carouselTextContainer}>
          <Text style={styles.carouselTitle}>{item.title.replace('File:', '') || 'No title'}</Text>
        </View>
      </View>
    );
  };


  if (!photo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Loading...'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.userPhoto} />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.resultContainer}>
          {landmarks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Landmark Detected</Text>
              <View style={styles.landmarkItem}>
                <Text style={styles.landmarkName}>{landmarks[0].name}</Text>
                <Text style={styles.landmarkCountry}>{landmarks[0].country}</Text>
                <Text style={styles.confidence}>Confidence: {(landmarks[0].confidence * 100).toFixed(2)}%</Text>
              </View>
            </View>
          )}

          {historicPhotosLoading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : historicPhotos.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historic Photos</Text>
              <Carousel
                ref={carouselRef}
                data={historicPhotos}
                renderItem={renderHistoricPhoto}
                sliderWidth={screenWidth}
                itemWidth={screenWidth * 0.8}
                layout={'default'}
                removeClippedSubviews={false}
                useScrollView={true}
              />
              <TouchableOpacity onPress={() => handleSeeMore(landmarks[0]?.name)} style={styles.seeMoreButton}>
                <Text style={styles.seeMoreButtonText}>See More</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.noResultText}>No historic photos found</Text>
          )}

          {webEntities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Related Entities</Text>
              <View style={styles.entitiesContainer}>
                {webEntities.map((entity, index) => (
                  <Text key={index} style={styles.entityItem}>{entity.description}</Text>
                ))}
              </View>
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
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userPhoto: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  resultContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  landmarkItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
  },
  landmarkName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  landmarkCountry: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  confidence: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  carouselItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  carouselTextContainer: {
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  carouselTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  seeMoreButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  seeMoreButtonText: {
    color: 'white',
    fontSize: 16,
  },
  entitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entityItem: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  feedbackQuestion: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
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
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  noResultText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});

export default ResultsScreen;