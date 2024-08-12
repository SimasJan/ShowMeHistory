import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';


function HomeScreen({ navigation }) {
  const [imageUri, setImageUri] = useState(null)
  const [labels, setLabels] = useState([])

  const pickImage = async () => {
    try { 
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri)
            setLabels([])
        }
        navigation.navigate('Results')
    } catch (error) {
        console.log('Error reading an image: ', error)
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 20 }}>🏯 Show Me History 📜</Text>
        <Text style={{ fontSize: 12, padding: 10, color: 'black'}}>Find historic photos of landmarks in front of you!</Text>
        <Text style={{ fontSize: 15, padding: 10, marginTop: 20, color: 'black'}}>Start by taking a picture of a landmark 😎</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Take a Picture"
          onPress={() => navigation.navigate('Camera')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Upload a Photo"
          onPress={pickImage}
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