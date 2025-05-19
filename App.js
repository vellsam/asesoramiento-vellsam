// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import MainApp from './src/MainApp';
import { LanguageProvider } from './src/context/LanguageContext';
import ResumenScreen from './src/screens/ResumenScreen';
import GlosarioScreen from './src/screens/GlosarioScreen';
import AsesoramientoScreen from './src/screens/AsesoramientoScreen.js'; // ✅ Importación correcta

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <LanguageProvider>
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
            options={{
              title: 'Asistente Vellsam',
              headerStyle: { backgroundColor: '#1c4c25' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Glosario"
            component={GlosarioScreen}
            options={{
              title: 'Glosario',
              headerStyle: { backgroundColor: '#1c4c25' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Resumen"
            component={ResumenScreen}
            options={{
              title: 'Resumen',
              headerStyle: { backgroundColor: '#1c4c25' },
              headerTintColor: '#fff',
            }}
          />
          <Stack.Screen
            name="Asesoramiento"
            component={AsesoramientoScreen}
            options={{
              title: 'Asesoramiento',
              headerStyle: { backgroundColor: '#FF8800' },
              headerTintColor: '#fff',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}
