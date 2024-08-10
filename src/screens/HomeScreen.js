import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 20 }}>Welcome to Historic Landmark App!</Text>
        <Text style={{ fontSize: 15, padding: 10, color: 'black'}}>Take a picture to begin and to find historic information about the landmark!</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Take a Picture"
          onPress={() => navigation.navigate('Camera')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    // justifyContent: 'center',
    alignItems: 'center',
    padding: 10, 
    margin: 10, 
    fontSize: 20, 
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: 200,
    margin: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    borderStyle: 'solid',
    borderWidth: 1,
  },
});

export default HomeScreen;