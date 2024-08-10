import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import ThumbsFeedback from '../components/ThumbsFeedback';
import { analyzeImage } from '../services/visionApi';
import { saveResult } from '../services/database';

function ResultsScreen({ route }) {
  const { photo } = route.params;
  const [results, setResults] = useState(null);

  useEffect(() => {
    const getResults = async () => {
      const apiResults = await analyzeImage(photo.uri);
      setResults(apiResults);
      await saveResult(photo.uri, apiResults);
    };
    getResults();
  }, [photo]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: photo.uri }} style={styles.image} />
      {results ? (
        <View>
          {results.map((landmark, index) => (
            <View key={index} style={styles.landmarkContainer}>
              <Text style={styles.landmarkName}>{landmark.description}</Text>
              <Text>Confidence: {(landmark.score * 100).toFixed(2)}%</Text>
            </View>
          ))}
          <ThumbsFeedback photoUri={photo.uri} />
        </View>
      ) : (
        <Text>Loading results...</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
  resultText: {
    margin: 10,
  },
});

export default ResultsScreen;