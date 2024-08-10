import React, { useState, useEffect, useRef } from 'react';
import { Text, View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';

function CameraScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const cameraRef = useRef(CameraView);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.useCameraPermissions(); //useCameraPermissions();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log('photo', photo);
      setPhoto(photo);
    }
  };

  const retakePicture = () => {
    setPhoto(null);
  };

  const savePhoto = () => {
    navigation.navigate('Results', { photo });
  };

  if (!hasPermission) {
    // camera permisiosn are still loading
    return <View />;
  }
  if (!hasPermission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={setHasPermission(true)} title="grant permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {photo ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photo.uri }} style={styles.preview} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={retakePicture}>
              <Text style={styles.buttonText}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={savePhoto}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={styles.camera} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={takePicture}>
              <Text style={styles.buttonText}>Take Picture</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 20,
    padding: 10,
    gap: 10,
  },
  button: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 30,
    // marginHorizontal: 10,
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 15,
    color: 'black',
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black',
  },
  preview: {
    width: '100%',
    height: '80%',
    resizeMode: 'contain',
  },
});

export default CameraScreen;

// import React, { useState, useEffect, useRef } from 'react';
// import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
// import { Camera, useCameraPermissions } from 'expo-camera';

// function CameraScreen({ navigation }) {
//   const [facing, setFacing] = useState('back');
//   const [hasPermission, setHasPermission] = useState(null);
//   const cameraRef = useRef(null);

//   if (!hasPermission) {
//     // Camera permissions are still loading.
//     return <View />;
//   }

//   if (!hasPermission.granted) {
//     // Camera permissions are not granted yet.
//     return (
//       <View style={styles.container}>
//         <Text style={styles.message}>We need your permission to show the camera</Text>
//         <Button onPress={requestPermission} title="grant permission" />
//       </View>
//     );
//   }

//   const takePicture = async () => {
//     if (cameraRef.current) {
//       const photo = await cameraRef.current.takePictureAsync();
//       navigation.navigate('Results', { photo });
//     }
//   };
  
//   return (
//     <View style={styles.container}>
//       <Camera style={styles.camera} ref={cameraRef}>
//         <View style={styles.buttonContainer}>
//           <TouchableOpacity style={styles.button} onPress={takePicture}>
//             <Text style={styles.buttonText}>Take Picture</Text>
//           </TouchableOpacity>
//         </View>
//       </Camera>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   camera: {
//     flex: 1,
//   },
//   buttonContainer: {
//     flex: 1,
//     backgroundColor: 'transparent',
//     flexDirection: 'row',
//     justifyContent: 'center',
//     margin: 20,
//   },
//   button: {
//     alignSelf: 'flex-end',
//     alignItems: 'center',
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 5,
//   },
//   buttonText: {
//     fontSize: 18,
//     color: 'black',
//   },
// });

// export default CameraScreen;