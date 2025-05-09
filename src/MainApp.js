import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Linking, ActivityIndicator, Alert, Image, useColorScheme } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { getRecomendaciones } from './logic/recomendaciones';
import { cultivos } from './data/cultivos';
import { enviarCorreoConRecomendaciones } from './utils/enviarCorreo';
import countryRegionData from './data/countryRegionData.json';

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
  const colorScheme = useColorScheme();

  const isDark = colorScheme === 'dark';
  const logo = isDark
    ? require('../assets/Vellsam_horizontal_blanco.png')
    : require('../assets/Vellsam_horizontal_verde.png');

  const theme = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#1e1e1e' : '#f0f0f0',
    border: isDark ? '#333' : '#ccc',
  };

  const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 20, backgroundColor: theme.background },
    label: { fontSize: 18, marginBottom: 10, color: theme.text },
    input: {
      borderWidth: 1, borderColor: theme.border, padding: 8,
      marginBottom: 15, borderRadius: 5, color: theme.text, backgroundColor: theme.card,
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
  });

  const nombreFases = {
    FLOR: 'Floración', ENR: 'Enraizamiento', CUA: 'Cuajado', ENG: 'Engorde',
    MAD: 'Maduración', SN: 'Sanidad', VEG: 'Vegetativo', BRO: 'Brotación',
    PR: 'Poda de retorno', NAS: 'Nascencia', AHI: 'Ahijado', ENC: 'Encañado',
  };

  const listaCultivos = Object.keys(cultivos).map((key) => ({
    label: key.charAt(0).toUpperCase() + key.slice(1),
    value: key,
  }));

  const fasesDisponibles = Object.keys(nombreFases);
  const countryList = countryRegionData.map(item => item.country);
  const regionesDisponibles = countryRegionData.find(p => p.country === country)?.regions || [];

  const camposCompletosPaso0 = name && email && country && region && hectareas;
  const camposCompletosPaso1 = crop && phase && production;

  const handleFinish = async () => {
    if (enviando) return;
    setEnviando(true);

    const resultados = getRecomendaciones({ cultivo: crop, fase: phase, tipo: production });
    setRecomendados(resultados);
    const hectareasNormalizadas = hectareas.replace(',', '.');

    try {
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

      await enviarCorreoConRecomendaciones({
        nombre: name,
        email: email,
        recomendaciones: resultados,
      });

      Alert.alert('✅ Datos guardados', 'Tus datos se han guardado correctamente.');
    } catch (error) {
      console.error('❌ Error al guardar en Sheets:', error);
      Alert.alert('❌ Error', 'No se han podido guardar tus datos.');
    }

    setEnviando(false);
    setStep(3);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={logo} style={styles.logo} />

      {step === 0 && (
        <>
          <Text style={styles.label}>¿Cómo te llamas?</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />

          <Text style={styles.label}>Correo electrónico:</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

          <Text style={styles.label}>¿En qué país se encuentra tu cultivo?</Text>
          <Picker selectedValue={country} onValueChange={(val) => { setCountry(val); setRegion(''); }} style={styles.picker}>
            <Picker.Item label="Selecciona un país" value="" />
            {countryList.map((pais) => (
              <Picker.Item key={pais} label={pais} value={pais} />
            ))}
          </Picker>

          {country && (
            <>
              <Text style={styles.label}>¿En qué región o provincia?</Text>
              <Picker selectedValue={region} onValueChange={setRegion} style={styles.picker}>
                <Picker.Item label="Selecciona una región" value="" />
                {regionesDisponibles.map((reg) => (
                  <Picker.Item key={reg} label={reg} value={reg} />
                ))}
              </Picker>
            </>
          )}

          <Text style={styles.label}>¿Cuántas hectáreas cultivas?</Text>
          <TextInput style={styles.input} value={hectareas} onChangeText={setHectareas} keyboardType="decimal-pad" placeholder="Ej: 2.5" />

          <Button title="Siguiente" onPress={() => setStep(1)} disabled={!camposCompletosPaso0} />
        </>
      )}

      {step === 1 && (
        <>
          <Text style={styles.label}>¿Qué cultivo tienes?</Text>
          <Picker selectedValue={crop} onValueChange={setCrop} style={styles.picker}>
            <Picker.Item label="Selecciona un cultivo" value="" />
            {listaCultivos.map((item) => <Picker.Item key={item.value} label={item.label} value={item.value} />)}
          </Picker>

          <Text style={styles.label}>¿Qué fase tiene el cultivo?</Text>
          <Picker selectedValue={phase} onValueChange={setPhase} style={styles.picker}>
            <Picker.Item label="Selecciona una fase" value="" />
            {fasesDisponibles.map((f) => <Picker.Item key={f} label={nombreFases[f]} value={f} />)}
          </Picker>

          <Text style={styles.label}>Tipo de producción:</Text>
          <Picker selectedValue={production} onValueChange={setProduction} style={styles.picker}>
            <Picker.Item label="Selecciona el tipo" value="" />
            <Picker.Item label="Convencional" value="Convencional" />
            <Picker.Item label="Ecológica" value="Ecológica" />
          </Picker>

          {enviando && <ActivityIndicator size="large" color="#007bff" />}
          <Button title="Ver recomendaciones" onPress={handleFinish} disabled={!camposCompletosPaso1 || enviando} />
        </>
      )}

      {step === 3 && (
        <>
          <Text style={styles.label}>✅ ¡Gracias, {name}!</Text>
          <Text style={styles.label}>País: {country} — Región: {region} — Hectáreas: {hectareas}</Text>
          <Text style={styles.label}>Productos recomendados para el cultivo {crop.charAt(0).toUpperCase() + crop.slice(1)} en fase {nombreFases[phase] || phase}:</Text>

          {recomendados.length > 0 ? (
            recomendados.map((prod, index) => (
              <View key={index} style={styles.card}>
                <Text style={styles.productName}>{prod.nombre}</Text>
                {prod.rad && <Text style={styles.productDetail}>Dosis radicular: {prod.rad} L/Ha</Text>}
                {prod.url && <Text style={styles.link} onPress={() => Linking.openURL(prod.url)}>Más info</Text>}
              </View>
            ))
          ) : (
            <Text style={styles.label}>No se encontraron productos para esta combinación.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
}
