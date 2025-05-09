// src/screens/HomeScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Asistente');
    });
  };

  return (
    <ImageBackground
      source={require('../../assets/vellsaminicio.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <Animated.View
            style={[
              styles.button,
              {
                transform: [
                  { scale: scaleAnim },
                  { translateY: slideAnim },
                ],
                opacity: fadeAnim,
              },
            ]}
          >
            <Text style={styles.buttonText}>Iniciar asistente</Text>
          </Animated.View>
        </TouchableWithoutFeedback>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    width,
    height,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  overlay: {
    width: '100%',
    alignItems: 'center',
    paddingBottom: 80,
  },
  button: {
    backgroundColor: '#1c4c25',
    paddingVertical: 16,
    paddingHorizontal: 30,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
