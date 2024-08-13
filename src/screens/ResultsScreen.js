import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, Linking, ImageBackground } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { googleVisionApiKey } from '../../creds/apiKey';
import { Ionicons } from '@expo/vector-icons';
import { searchHistoricPhotos } from '../services/historicPhotoService';
import Carousel from 'react-native-snap-carousel';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateImageHash } from '../utils/imageHash';
import { getGeminiInfo } from '../services/geminiService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const [imageHash, setImageHash] = useState(null);
  const [geminiResult, setGeminiResult] = useState(null);


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
      hashImage(route.params.photo.uri);
    }
  }, [photo]);

  useEffect(() => {
    if (landmarks.length > 0) {
      console.log('Fetching historic photos for:', landmarks[0].name);
      fetchHistoricPhotos(landmarks[0].name);
    }
  }, [landmarks]);

  const hashImage = async (uri) => {
    try {
      const hash = await generateImageHash(uri);
      setImageHash(hash);
      if (hash) {
        const cachedResult = await getCachedResult(hash);
        if (cachedResult) {
          // Use cached result
          setLandmarks(cachedResult.landmarks);
          setWebEntities(cachedResult.webEntities);
          setHistoricPhotos(cachedResult.historicPhotos);
          setLoading(false);
        } else {
          // Proceed with analysis
          analyzeImage(uri);
        }
      } else {
        throw new Error('Failed to generate image hash');
      }
    } catch (error) {
      console.error('Error in hashImage:', error);
      setError('Error processing image. Please try again.');
      setLoading(false);
    }
  };
    
  const getCachedResult = async (hash) => {
    try {
      const cachedData = await AsyncStorage.getItem(`@ImageAnalysis_${hash}`);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error reading cached data:', error);
      return null;
    }
  };
  
  const setCachedResult = async (hash, data) => {
    try {
      await AsyncStorage.setItem(`@ImageAnalysis_${hash}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  };

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
            position: `${landmark.locations[0].latLng.latitude?.toFixed(2)}, ${landmark.locations[0].latLng.longitude?.toFixed(2)}`,
            confidence: landmark.score
        }));
        console.log('Detected landmarks:', detectedLandmarks);
        setLandmarks(detectedLandmarks);
        
        // Fetch Gemini AI information
        try {
          const geminiInfo = await getGeminiInfo(detectedLandmarks[0].name);
          setGeminiResult(geminiInfo);
        } catch (geminiError) {
          console.error('Error fetching Gemini information:', geminiError.message);
          // Don't set an error state here, as we still want to show other results
        }
      }

      if (webDetection && webDetection.webEntities && webDetection.webEntities.length > 0) {
        setWebEntities(webDetection.webEntities.slice(0, 3));
      }

      if (!landmarkAnnotations && !webDetection) {
        setError('No information detected in the image.');
      }
      // After successful analysis, cache the result
      if (imageHash) {
        await setCachedResult(imageHash, {
            landmarks,
            webEntities,
            historicPhotos,
        });
      }

      // Fetch historic photos
      if (landmarks.length > 0) {
        console.log('Fetching historic photos for:', landmarks[0].name);
        await fetchHistoricPhotos(landmarks[0].name);
      }
      setLoading(false);
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
      <TouchableOpacity onPress={() => Linking.openURL(item.url)} style={styles.carouselItem}>
        <Image source={{ uri: item.thumbnail }} style={styles.carouselImage} />
        <BlurView intensity={6} style={styles.carouselTextContainer}>
          <Text style={styles.carouselTitle}>{item.title.replace('File:', '') || 'No title'}</Text>
        </BlurView>
      </TouchableOpacity>
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
      <ImageBackground source={{ uri: photo?.uri }} style={styles.header}>
        <BlurView intensity={5} style={styles.headerContent}>
          <Text style={styles.headerTitle}>Results</Text>
        </BlurView>
      </ImageBackground>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader}/>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.resultContainer}>
          {landmarks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Landmark Detected</Text>
              <View style={styles.landmarkItem}>
                <Text style={styles.landmarkName}>{landmarks[0].name}</Text>
                <Text style={styles.landmarkCountry}>{landmarks[0].country} ({landmarks[0].position})</Text>
                <View style={styles.confidenceBar}>
                  <View style={[styles.confidenceFill, { width: `${landmarks[0].confidence * 100}%` }]} />
                </View>
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
                sliderWidth={screenWidth * 0.8}
                itemWidth={screenWidth * 0.6}
                layout={'default'}
                loop={true}
                autoplay={true}
                autoplayInterval={3000}
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
          
          {geminiResult && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <ScrollView style={styles.geminiResultContainer}>
                <Text style={styles.geminiResultText}>{geminiResult}</Text>
              </ScrollView>
            </View>
          )}

          {webEntities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Related Entities</Text>
              <View style={styles.entitiesContainer}>
                {webEntities.map((entity, index) => (
                    <TouchableOpacity key={index} style={styles.entityItem}>
                      <Text style={styles.entityText}>{entity.description}</Text>
                    </TouchableOpacity>
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

export default ResultsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    height: screenHeight * 0.3,
    justifyContent: 'flex-end',
  },
  headerContent: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
  },
  resultContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 10,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  landmarkItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 1,
  },
  landmarkName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  landmarkCountry: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  confidenceBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 5,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  confidence: {
    fontSize: 14,
    color: '#888',
  },
  carouselItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  carouselTextContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  carouselTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  seeMoreButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    alignItems: 'center',
  },
  seeMoreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  entitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  entityItem: {
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
  },
  entityText: {
    fontSize: 14,
    color: '#007AFF',
  },
  feedbackContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  feedbackQuestion: {
    fontSize: 18,
    marginBottom: 15,
    color: '#333',
  },
  feedbackButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  feedbackButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 30,
    marginHorizontal: 15,
  },
  selectedFeedback: {
    backgroundColor: '#007AFF',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
  noResultText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  loader: {
    marginTop: 50,
  },
  geminiResultContainer: {
    maxHeight: 200,
    marginTop: 10,
  },
  geminiResultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
});
