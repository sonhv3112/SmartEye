import React from 'react'; 
import { createStackNavigator } from "@react-navigation/stack"; 
import { NavigationContainer } from "@react-navigation/native";

import Camera from './src/Camera'; 
import Splash from './src/Splash'; 

const Stack = createStackNavigator();

const App = () => { 
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Splash" component={Splash} options={{headerShown: false}} /> 
        <Stack.Screen name="Camera" component={Camera} options={{headerShown: false}} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;