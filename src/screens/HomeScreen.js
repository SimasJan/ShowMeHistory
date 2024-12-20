import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


function HomeScreen({ navigation }) {

 const pickImage = async () => {
    try { 
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          // console.log('Navigating to Results with: ', { photo: { uri: result.assets[0].uri }});
          navigation.navigate('Results', { photo: { uri: result.assets[0].uri } });
        } else {
          alert('No image selected');
          // console.log('Image picking cancelled or no asset selected!');
        }
    } catch (error) {
        console.log('Error reading an image: ', error);
        alert('Error selecting image. Please try again');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1}}>
      <ImageBackground source={require('../../assets/home-background.jpg')} style={styles.container}>
      <View style={styles.header}>
        <Text style={{ fontSize: 30, fontWeight: 'bold', color: 'white'}}>🏯 Show Me History</Text>
        <Text style={{ fontSize: 14, padding: 5, color: 'white'}}>Find historic photos of landmarks in front of you!</Text>
        {/* <Text style={{ fontSize: 15, padding: 5, marginTop: 20, color: 'black'}}>Start by taking a picture of a landmark 😎</Text> */}
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Camera')}>
          <Ionicons name="camera" size={24} color="black" />
          <Text style={styles.buttonText}>
            Capture Photo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="image" size={24} color="black" />
          <Text style={styles.buttonText} >Upload Photo</Text>
        </TouchableOpacity>
      </View>
      <View>
        <Text style={{ fontSize: 12, padding: 10, color: 'white', marginTop: '35%'}}>
          Developed with ❤️ by <Text style={{ fontWeight: 'bold' }}>Simas</Text>
          {/* TODO: Add a donate button! Will open a browser to payment page to support the project! */}
        </Text>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    backgroundColor: 'transparent',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    width: '75%',
    flexDirection: 'column',
    margin: 10,
    opacity: 0.8
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 2,
    padding: 30,
    margin: 20
    ,
    alignItems: 'center',
    opacity: 0.8
  },
  buttonText: {
    fontSize: 16,
    color: 'black',
  },
});

export default HomeScreen;