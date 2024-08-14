import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, Linking, ImageBackground } from 'react-native';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { googleVisionApiKey } from '../../creds/apiKeys';
import { Ionicons } from '@expo/vector-icons';
import { searchHistoricPhotos } from '../services/historicPhotoService';
import Carousel from 'react-native-snap-carousel';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
// custom
import { ApiService } from '../services/apiServices';
import { CachingService } from '../services/caching';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

function ResultsScreen({ route }) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const carouselRef = useRef(null);
  const [analysisResult, setAnalysisResult] = useState({
    landmarks: [],
    webEntities: [],
    historicPhotos: [],
    geminiResult: null,
  });

  // const [historicPhotos, setHistoricPhotos] = useState([]);
  // const [landmarks, setLandmarks] = useState([]);
  // const [webEntities, setWebEntities] = useState([]);
  // const [historicPhotosLoading, setHistoricPhotosLoading] = useState(true);
  // const [historicPhotosError, setHistoricPhotosError] = useState(null);

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
        <BlurView intensity={80} style={styles.carouselTextContainer}>
          <Text style={styles.carouselTitle}>{item.title.replace('File:', '') || 'No title'}</Text>
        </BlurView>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    if (route.params && route.params.photo) {
      setPhoto(route.params.photo);
      processImage(route.params.photo.uri);
    } else {
      setError('No photo provided');
      setLoading(false);
    }
  }, [route.params, processImage]);

  
  const processImage = useCallback(async (uri) => {
    try {
      setLoading(true);
      const hash = await CachingService.generateImageHash(uri);
      const cachedResult = await CachingService.getItem(`@ImageAnalysis_${hash}`);

      if (cachedResult) {
        console.log('Cached results found! Using cached analysis result!');
        setAnalysisResult(cachedResult);
        setLoading(false);
        // Update in background
        console.log('Updating in background cached result!')
        updateAnalysisInBackground(uri, hash);
      } else {
        console.log('No cache found! Performing full analysis...');
        const result = await performFullAnalysis(uri);
        setAnalysisResult(result);
        await CachingService.setItem(`@ImageAnalysis_${hash}`, result);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setError('Error processing image. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const performFullAnalysis = async (uri) => {
    try {
      console.log('[performFullAnalysis] Starting analysis for uri:', uri);
  
      // Check if the uri is valid
      if (!uri || typeof uri !== 'string') {
        throw new Error(`Invalid URI provided: ${uri}`);
      }
  
      // Attempt to read the file
      let base64Image;
      try {
        base64Image = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
        console.log('[performFullAnalysis] Successfully read image file. Length:', base64Image.length);
      } catch (readError) {
        console.error('[performFullAnalysis] Error reading file:', readError);
        throw new Error(`Failed to read image file: ${readError.message}`);
      }
  
      // Check if base64Image is valid
      if (!base64Image || base64Image.length === 0) {
        throw new Error('Read file is empty or invalid');
      }
  
      // Perform initial API calls concurrently
      console.log('[performFullAnalysis] Initiating API calls');
      const [visionResult, initialHistoricPhotos] = await Promise.all([
        ApiService.objectDetection(base64Image),
        ApiService.searchHistoricPhotos(''),  // Initial search without landmark name
      ]);
      console.log('[performFullAnalysis] API calls completed');
  
      // Process landmarks
      const landmarks = visionResult.landmarkAnnotations?.map(landmark => ({
        name: landmark.description,
        country: landmark.locations?.[0]?.latLng?.latitude > 0 ? 'Northern Hemisphere' : 'Southern Hemisphere',
        position: landmark.locations?.[0]?.latLng 
          ? `${landmark.locations[0].latLng.latitude?.toFixed(2) ?? 'N/A'}, ${landmark.locations[0].latLng.longitude?.toFixed(2) ?? 'N/A'}`
          : 'Position not available',
        confidence: landmark.score ?? 0,
        source: 'landmark',
      })) || [];
  
      console.log('[performFullAnalysis] Landmarks:', landmarks);

      // Process web entities
      const webEntities = visionResult.webDetection?.webEntities?.map(entity => ({
        name: entity.description,
        confidence: entity.score ?? 0,
        source: 'webEntity',
      })) || [];
      console.log('[performFullAnalysis] Web entities:', webEntities);
  
      // Cross-reference and merge results
      const mergedResults = crossReferenceResults(landmarks, webEntities);
  
      let geminiResult = null;
      let historicPhotos = initialHistoricPhotos;
  
      // If we have any results, get additional information
      if (mergedResults.length > 0) {
        const primaryResult = mergedResults[0];
        console.log('[performFullAnalysis] Primary result:', primaryResult.name);
  
        const [geminiInfo, updatedHistoricPhotos] = await Promise.all([
          ApiService.getGeminiInfo(primaryResult.name).catch(error => {
            console.error('Error fetching Gemini info:', error);
            return null;
          }),
          ApiService.searchHistoricPhotos(primaryResult.name).catch(error => {
            console.error('Error fetching updated historic photos:', error);
            return initialHistoricPhotos;  // Fallback to initial results
          }),
        ]);
  
        geminiResult = geminiInfo;
        historicPhotos = updatedHistoricPhotos;
      } else {
        console.log('[performFullAnalysis] No landmarks or web entities detected');
      }
  
      console.log('[performFullAnalysis] Analysis completed successfully');
      return { 
        landmarks: mergedResults, 
        webEntities: webEntities.slice(0, 3),  // Keep original top 3 web entities
        historicPhotos, 
        geminiResult 
      };
    } catch (error) {
      console.error('[performFullAnalysis] Error:', error);
      throw new Error(`Failed to perform full analysis: ${error.message}`);
    }
  };

  const crossReferenceResults = (landmarks, webEntities) => {
    const results = [...landmarks];

    webEntities.forEach(entity => {
      const matchingLandmark = landmarks.find(landmark =>
        landmark.name.toLowerCase().includes(entity.name.toLowerCase()) ||
        entity.name.toLowerCase().includes(landmark.name.toLowerCase())
      );

      if (matchingLandmark) {
        matchingLandmark.confidence = Math.max(matchingLandmark.confidence, entity.confidence);
        matchingLandmark.webEntityMatch = true;
      } else {
        results.push({
          name: entity.name,
          country: 'Unknown',
          position: 'Position not available',
          confidence: entity.confidence,
          source: 'webEntity',
        });
      }
    });

    return results.sort((a, b) => {
      if (a.webEntityMatch && !b.webEntityMatch) return -1;
      if (!a.webEntityMatch && b.webEntityMatch) return 1;
      return b.confidence - a.confidence;
    });
  };

  const updateAnalysisInBackground = async (uri, hash) => {
    try {
      const updatedResult = await performFullAnalysis(uri);
      await CachingService.setItem(`@ImageAnalysis_${hash}`, updatedResult);
      setAnalysisResult(updatedResult);
    } catch (error) {
      console.error('Error updating analysis in background:', error);
    }
  };

  if (!photo) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error || 'Loading...'}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1}}>
      <ScrollView style={styles.container}>

        <ImageBackground source={{ uri: photo.uri }} style={styles.header}>
          <BlurView intensity={70} style={styles.headerContent}>
            <Text style={styles.headerTitle}>Results</Text>
          </BlurView>
        </ImageBackground>

        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" style={styles.loader}/>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View style={styles.resultContainer}>
            {analysisResult.landmarks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Landmark Detected</Text>
                <View style={styles.landmarkItem}>
                  <Text style={styles.landmarkName}>{analysisResult.landmarks[0].name}</Text>
                  <Text style={styles.landmarkCountry}>{analysisResult.landmarks[0].country} ({analysisResult.landmarks[0].position?.lat}, {analysisResult.landmarks[0].position?.long})</Text>
                  <View style={styles.confidenceBar}>
                    <View style={[styles.confidenceFill, { width: `${analysisResult.landmarks[0].confidence * 100}%` }]} />
                  </View>
                  <Text style={styles.confidence}>Confidence: {(analysisResult.landmarks[0].confidence * 100).toFixed(2)}%</Text>
                </View>
              </View>
            )}

            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : analysisResult.historicPhotos.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Historic Photos</Text>
                <Carousel
                  ref={carouselRef}
                  data={analysisResult.historicPhotos}
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
                <TouchableOpacity onPress={() => handleSeeMore(analysisResult.landmarks[0]?.name)} style={styles.seeMoreButton}>
                  <Text style={styles.seeMoreButtonText}>See More</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.noResultText}>No historic photos found 😔</Text>
            )}

            {analysisResult.webEntities.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Related Entities</Text>
                <View style={styles.entitiesContainer}>
                  {analysisResult.webEntities.map((entity, index) => (
                      <TouchableOpacity key={index} style={styles.entityItem}>
                        <Text style={styles.entityText}>{entity.name}</Text>

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
    </SafeAreaView>
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
    height: screenHeight * 0.7,
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
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  landmarkItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
  },
  landmarkName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  landmarkCountry: {
    fontSize: 13,
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
});