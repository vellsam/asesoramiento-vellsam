import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView, Linking,
  ActivityIndicator, Alert, Image, useColorScheme, Switch, TouchableOpacity, Share, Animated
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { getRecomendaciones } from './logic/recomendaciones';
import { cultivos } from './data/cultivos';
import { enviarCorreoConRecomendaciones, enviarCorreoSinRecomendaciones } from './utils/enviarCorreo';
import countryRegionData from './data/countryRegionData.json';
import { traducirPais } from './utils/paisTraducciones';
import { useFocusEffect } from '@react-navigation/native';
import { useLanguage } from './context/LanguageContext';
import { strings } from './strings';
import { useNavigation } from '@react-navigation/native';


export default function MainApp() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [crop, setCrop] = useState('');
  const [production, setProduction] = useState('');
  const [phase, setPhase] = useState('');
  const [hectareas, setHectareas] = useState('');
  const [recomendados, setRecomendados] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [aceptaAlmacenamiento, setAceptaAlmacenamiento] = useState(false);
  const [countryLocked, setCountryLocked] = useState(false);
  const [regionLocked, setRegionLocked] = useState(false);
  const [cropLocked, setCropLocked] = useState(false);
  const [phaseLocked, setPhaseLocked] = useState(false);
  const [productionLocked, setProductionLocked] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [hectareasError, setHectareasError] = useState('');

  const [_, forceUpdate] = useState(0);
  useFocusEffect(React.useCallback(() => { forceUpdate(n => n + 1); }, []));

  const { language } = useLanguage();
  const t = strings[language];
  const navigation = useNavigation();

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const botonColor = isDark ? '#FF8800' : '#1c4c25';
  const logo = isDark
    ? require('../assets/Vellsam_horizontal_blanco.png')
    : require('../assets/Vellsam_horizontal_verde.png');

  const theme = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#1e1e1e' : '#f0f0f0',
    border: isDark ? '#333' : '#ccc',
  };

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: theme.background },
    label: { fontSize: 18, marginBottom: 10, color: theme.text },
    input: {
      borderWidth: 1, borderColor: theme.border, padding: 8,
      marginBottom: 5, borderRadius: 5, color: theme.text, backgroundColor: theme.card,
    },
    picker: {
      borderWidth: 1, borderColor: theme.border, marginBottom: 20,
      color: theme.text, backgroundColor: theme.card,
    },
    card: {
      borderWidth: 1, borderColor: theme.border, padding: 10,
      marginVertical: 10, borderRadius: 6, backgroundColor: theme.card,
    },
    productName: { fontWeight: 'bold', fontSize: 16, color: theme.text },
    productDetail: { fontSize: 14, marginTop: 5, color: theme.text },
    link: { fontSize: 14, color: '#66aaff', marginTop: 5 },
    logo: {
      width: 200, height: 60, resizeMode: 'contain',
      alignSelf: 'center', marginBottom: 20, marginTop: 20,
    },
    errorText: { color: '#ff4d4d', marginBottom: 10 },
    customButton: {
      paddingVertical: 14,
      paddingHorizontal: 30,
      borderRadius: 30,
      alignItems: 'center',
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 5,
    },
    disabledButton: {
      backgroundColor: '#999',
      shadowOpacity: 0,
    },
    customButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

  const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const validarHectareas = (valor) => {
    const num = parseFloat(valor.replace(',', '.'));
    return !isNaN(num) && num > 0;
  };
  const validarNombre = (nombre) => /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(nombre.trim());

  const listaCultivos = Object.keys(cultivos).map((key) => ({
    label: t.crops[key] || key,
    value: key,
  }));

  const fasesDisponibles = Object.keys(t.phaseNames);
  const countryList = countryRegionData.map(item => item.country);
  const regionesDisponibles = countryRegionData.find(p => p.country === country)?.regions || [];

  const camposCompletosPaso0 =
    name && email && country && region && hectareas &&
    validarCorreo(email) && validarHectareas(hectareas) && validarNombre(name);

  const camposCompletosPaso1 = crop && phase && production;

  const handleTransition = (nextStep) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setStep(nextStep);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleFinish = async () => {
    if (enviando) return;
    setEnviando(true);

    const resultados = getRecomendaciones({ cultivo: crop, fase: phase, tipo: production });
    setRecomendados(resultados);
    const hectareasNormalizadas = hectareas.replace(',', '.');

    try {
      if (aceptaAlmacenamiento) {
        await axios.post('https://api.sheety.co/50910ab5d9fcb816bfcd3ad8a1bb2169/datosAsesoramiento/datos', {
          dato: {
            nombre: name,
            correo: email,
            pais: country,
            provincia: region,
            hectareas: hectareasNormalizadas,
            cultivo: crop,
            fase: phase,
            produccion: production,
            fecha: new Date().toISOString(),
          },
        });
      }

      if (resultados.length > 0) {
        await enviarCorreoConRecomendaciones({ nombre: name, email: email, recomendaciones: resultados });
      } else {
        await enviarCorreoSinRecomendaciones({ nombre: name, email: email });
      }

      Alert.alert('✅', t.emailSuccess);
    } catch (error) {
      console.error('❌ Error:', error);
      Alert.alert('❌', t.emailError);
    }

    setEnviando(false);
    handleTransition(3);
  };

  const handleShare = async () => {
    try {
      const contenido = `
${t.thankYou}, ${name}!

${t.productsRecommended} ${t.crops[crop] || crop} — ${t.phaseNames[phase] || phase}:

${recomendados.map(prod =>
  `• ${prod.nombre}${prod.rad ? ` (Dosis: ${prod.rad} L/Ha)` : ''}`
).join('\n')}

${t.countryQuestion}: ${country}
${t.regionQuestion}: ${region}
${t.hectaresQuestion}: ${hectareas}
      `;
      await Share.share({ message: contenido.trim() });
    } catch (error) {
      Alert.alert('❌', 'Error al compartir');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} />
      <Animated.View style={{ opacity: fadeAnim }}>
        {step === 0 && (
          <>
            <Text style={styles.label}>{t.nameQuestion}</Text>
            <TextInput
              style={[styles.input, nameError ? { borderColor: '#ff4d4d' } : {}]}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setNameError(validarNombre(text) ? '' : t.errorName);
              }}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <Text style={styles.label}>{t.email}</Text>
            <TextInput
              style={[styles.input, emailError ? { borderColor: '#ff4d4d' } : {}]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError(validarCorreo(text) ? '' : t.errorEmail);
              }}
              keyboardType="email-address"
            />
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

                <Text style={styles.label}>{t.countryQuestion}</Text>
                <Picker
                selectedValue={country}
                onValueChange={(val) => {
                setCountry(val);
                setRegion('');
                setCountryLocked(val !== '');
                }}
                enabled={!countryLocked}
                style={styles.picker}
                >
                <Picker.Item label="--" value="" />
               {countryList.map((pais) => (
                <Picker.Item key={pais} label={traducirPais(pais, language)} value={pais} />
               ))}
               </Picker>
                {country && countryLocked && (
                <TouchableOpacity onPress={() => setCountryLocked(false)}>
                <Text style={{ color: '#66aaff', textDecorationLine: 'underline' }}>✏️ {t.edit}</Text>
                </TouchableOpacity>
                )}  

            {country !== '' && (
              <>
                <Text style={styles.label}>{t.regionQuestion}</Text>
<Picker
  selectedValue={region}
  onValueChange={(val) => {
    setRegion(val);
    setRegionLocked(val !== '');
  }}
  enabled={!regionLocked}
  style={styles.picker}
>
  <Picker.Item label="--" value="" />
  {regionesDisponibles.map((reg) => (
    <Picker.Item key={reg} label={reg} value={reg} />
  ))}
</Picker>
{region && regionLocked && (
  <TouchableOpacity onPress={() => setRegionLocked(false)}>
    <Text style={{ color: '#66aaff', textDecorationLine: 'underline' }}>✏️ {t.edit}</Text>
  </TouchableOpacity>
)}

              </>
            )}

            <Text style={styles.label}>{t.hectaresQuestion}</Text>
            <TextInput
              style={[styles.input, hectareasError ? { borderColor: '#ff4d4d' } : {}]}
              value={hectareas}
              onChangeText={(text) => {
                setHectareas(text);
                setHectareasError(validarHectareas(text) ? '' : t.errorHectares);
              }}
              keyboardType="decimal-pad"
              placeholder="Ej: 2.5"
            />
            {hectareasError ? <Text style={styles.errorText}>{hectareasError}</Text> : null}

            <TouchableOpacity
              onPress={() => handleTransition(1)}
              disabled={!camposCompletosPaso0}
              style={[
                styles.customButton,
                { backgroundColor: botonColor },
                !camposCompletosPaso0 && styles.disabledButton
              ]}
            >
              <Text style={styles.customButtonText}>{t.next}</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 1 && (
          <>
            <Text style={styles.label}>{t.cropQuestion}</Text>
<Picker
  selectedValue={crop}
  onValueChange={(val) => {
    setCrop(val);
    setCropLocked(val !== '');
  }}
  enabled={!cropLocked}
  style={styles.picker}
>
  <Picker.Item label="--" value="" />
  {listaCultivos.map((item) => (
    <Picker.Item key={item.value} label={item.label} value={item.value} />
  ))}
</Picker>
{crop && cropLocked && (
  <TouchableOpacity onPress={() => setCropLocked(false)}>
    <Text style={{ color: '#66aaff', textDecorationLine: 'underline' }}>✏️ {t.edit}</Text>
  </TouchableOpacity>
)}


            <Text style={styles.label}>{t.phaseQuestion}</Text>
<Picker
  selectedValue={phase}
  onValueChange={(val) => {
    setPhase(val);
    setPhaseLocked(val !== '');
  }}
  enabled={!phaseLocked}
  style={styles.picker}
>
  <Picker.Item label="--" value="" />
  {fasesDisponibles.map((f) => (
    <Picker.Item key={f} label={t.phaseNames[f]} value={f} />
  ))}
</Picker>
{phase && phaseLocked && (
  <TouchableOpacity onPress={() => setPhaseLocked(false)}>
    <Text style={{ color: '#66aaff', textDecorationLine: 'underline' }}>✏️ {t.edit}</Text>
  </TouchableOpacity>
)}

              <TouchableOpacity onPress={() => navigation.navigate('Glosario')}>
              <Text style={{ color: '#66aaff', textDecorationLine: 'underline', marginBottom: 15 }}>
              {t.seeGlossary}
               </Text>
          </TouchableOpacity>
            <Text style={styles.label}>{t.productionType}</Text>
<Picker
  selectedValue={production}
  onValueChange={(val) => {
    setProduction(val);
    setProductionLocked(val !== '');
  }}
  enabled={!productionLocked}
  style={styles.picker}
>
  <Picker.Item label="--" value="" />
  <Picker.Item label={t.conventional} value="Convencional" />
  <Picker.Item label={t.organic} value="Ecológica" />
</Picker>
{production && productionLocked && (
  <TouchableOpacity onPress={() => setProductionLocked(false)}>
    <Text style={{ color: '#66aaff', textDecorationLine: 'underline' }}>✏️ {t.edit}</Text>
  </TouchableOpacity>
)}


            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15, flexWrap: 'wrap' }}>
              <Switch
                value={aceptaAlmacenamiento}
                onValueChange={setAceptaAlmacenamiento}
                trackColor={{ false: '#ccc', true: '#1c4c25' }}
                thumbColor={aceptaAlmacenamiento ? '#FF8800' : '#f4f3f4'}
              />
              <Text style={{ marginLeft: 10, color: theme.text, flexShrink: 1 }}>
                {t.acceptStorage}{' '}
                <Text
                  style={{ color: '#66aaff', textDecorationLine: 'underline' }}
                  onPress={() => Linking.openURL('https://www.vellsam.com/aviso-legal/')}
                >
                  {t.seePolicy}
                </Text>.
              </Text>
            </View>

            {enviando && <ActivityIndicator size="large" color="#007bff" />}
            <TouchableOpacity
              onPress={() => handleTransition(2)}
              disabled={!camposCompletosPaso1 || !aceptaAlmacenamiento || enviando}
              style={[
                styles.customButton,
                { backgroundColor: botonColor },
                (!camposCompletosPaso1 || !aceptaAlmacenamiento || enviando) && styles.disabledButton
              ]}
            >
              <Text style={styles.customButtonText}>{t.viewRecommendations}</Text>
            </TouchableOpacity>
          </>
        )}
{step === 2 && (
  <>
    <Text style={styles.label}>{t.reviewData}</Text>
    <View style={styles.card}>
      <Text style={styles.productDetail}>👤 {t.nameQuestion}: {name}</Text>
      <Text style={styles.productDetail}>📧 {t.email}: {email}</Text>
      <Text style={styles.productDetail}>🌍 {t.countryQuestion}: {traducirPais(country, language)}</Text>
      <Text style={styles.productDetail}>🏞 {t.regionQuestion}: {region}</Text>
      <Text style={styles.productDetail}>🌱 {t.cropQuestion}: {t.crops[crop] || crop}</Text>
      <Text style={styles.productDetail}>🔄 {t.phaseQuestion}: {t.phaseNames[phase]}</Text>
      <Text style={styles.productDetail}>🚜 {t.productionType}: {production}</Text>
      <Text style={styles.productDetail}>📏 {t.hectaresQuestion}: {hectareas}</Text>
    </View>

    {enviando && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 15 }} />}

    <TouchableOpacity
      onPress={() => setStep(1)}
      style={[styles.customButton, { backgroundColor: '#666' }]}
    >
      <Text style={styles.customButtonText}>← {t.edit}</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={handleFinish}
      disabled={enviando}
      style={[styles.customButton, { backgroundColor: botonColor }, enviando && styles.disabledButton]}
    >
      <Text style={styles.customButtonText}>{t.confirmAndSend}</Text>
    </TouchableOpacity>
  </>
)}

        {step === 3 && (
  <>
    <Text style={styles.label}>✅ {t.thankYou}, {name}!</Text>
    <Text style={styles.label}>{t.productsRecommended} {t.crops[crop] || crop} — {t.phaseNames[phase] || phase}:</Text>

    {recomendados.length > 0 ? (
      recomendados.map((prod, i) => (
        <View key={i} style={styles.card}>
          <Text style={styles.productName}>{prod.nombre}</Text>
          {prod.rad && <Text style={styles.productDetail}>Dosis radicular: {prod.rad} L/Ha</Text>}
          {prod.url && (
            <Text style={styles.link} onPress={() => Linking.openURL(prod.url)}>Más info</Text>
          )}
        </View>
      ))
    ) : (
      <Text style={styles.label}>{t.noRecommendations}</Text>
    )}

    <TouchableOpacity
      onPress={handleShare}
      style={[styles.customButton, { backgroundColor: botonColor }]}
    >
      <Text style={styles.customButtonText}>📤 {t.share}</Text>
    </TouchableOpacity>

    <TouchableOpacity
      onPress={() => setStep(0)}
      style={[styles.customButton, { backgroundColor: '#888' }]}
    >
      <Text style={styles.customButtonText}>↺ {t.startOver}</Text>
    </TouchableOpacity>
  </>
)}

      </Animated.View>
    </ScrollView>
  );
}
