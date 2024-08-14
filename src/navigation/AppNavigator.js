import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CameraScreen from '../screens/CameraScreen';
import ResultsScreen from '../screens/ResultsScreen';

const Stack = createStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Camera" component={CameraScreen} options={{ headerShown: false }}/>
      <Stack.Screen name="Results" component={ResultsScreen} options={{ headerShown: false }}/>
    </Stack.Navigator>
  );
}

export default AppNavigator;