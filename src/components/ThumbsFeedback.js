import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { updateFeedback } from '../services/database';

function ThumbsFeedback({ photoUri }) {
  const handleFeedback = async (isPositive) => {
    await updateFeedback(photoUri, isPositive);
    // You can add some user feedback here, like a toast notification
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => handleFeedback(true)}>
        <Ionicons name="thumbs-up" size={24} color="green" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleFeedback(false)}>
        <Ionicons name="thumbs-down" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
});

export default ThumbsFeedback;