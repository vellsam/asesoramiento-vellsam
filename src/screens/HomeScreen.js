// src/screens/HomeScreen.js
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
  Dimensions,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { strings } from '../strings';
import { setStaticLanguage } from '../context/staticLanguage';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { language, setLanguage } = useLanguage();
  const t = strings[language];

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const imageFadeAnim = useRef(new Animated.Value(0)).current;
  const logoFadeAnim = useRef(new Animated.Value(0)).current;
  const logoTranslateAnim = useRef(new Animated.Value(-30)).current;

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
      Animated.timing(imageFadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(logoFadeAnim, {
          toValue: 1,
          duration: 1000,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateAnim, {
          toValue: 0,
          duration: 1000,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Vibration.vibrate(50);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => {
      navigation.navigate('Asistente');
    });
  };

  const cambiarIdioma = (lang) => {
    setLanguage(lang);
    setStaticLanguage(lang);
  };

  return (
    <View style={styles.wrapper}>
      <Animated.View style={{ flex: 1, opacity: imageFadeAnim }}>
        <ImageBackground
          source={require('../../assets/vellsaminicio.png')}
          style={styles.background}
          resizeMode="contain"
        >
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoFadeAnim,
                transform: [{ translateY: logoTranslateAnim }],
              },
            ]}
          >
            <Image
              source={require('../../assets/Logo_Vellsam_contorno.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

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
                <Text style={styles.buttonText}>{t.start}</Text>
              </Animated.View>
            </TouchableWithoutFeedback>

            <View style={styles.languageContainer}>
              <TouchableOpacity onPress={() => cambiarIdioma('es')}>
                <Text style={[
                  styles.languageOption,
                  language === 'es' && styles.languageSelected
                ]}>
                  🇪🇸 Español
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => cambiarIdioma('en')}>
                <Text style={[
                  styles.languageOption,
                  language === 'en' && styles.languageSelected
                ]}>
                  🇬🇧 English
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ImageBackground>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFBEF',
  },
  background: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
    width: '100%',
    alignItems: 'center',
  },
  logo: {
    width: 160,
    height: 100,
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
  languageContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 20,
  },
  languageOption: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1c4c25',
  },
  languageSelected: {
    textDecorationLine: 'underline',
  },
});
