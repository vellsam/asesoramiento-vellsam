// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import MainApp from './src/MainApp';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        <Stack.Screen
          name="Inicio"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Asistente"
          component={MainApp}
          options={{ title: 'Asistente Vellsam', headerStyle: { backgroundColor: '#1c4c25' }, headerTintColor: '#fff' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
