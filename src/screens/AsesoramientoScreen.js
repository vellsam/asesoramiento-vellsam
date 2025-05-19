import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet,
  Alert, TouchableOpacity, ActivityIndicator, useColorScheme
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as DocumentPicker from 'expo-document-picker';
import { strings } from '../strings';
import { useLanguage } from '../context/LanguageContext';
import countryRegionData from '../data/countryRegionData.json';
import { traducirPais } from '../utils/paisTraducciones';

export default function AsesoramientoScreen() {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [pais, setPais] = useState('');
  const [provincia, setProvincia] = useState('');
  const [hectareas, setHectareas] = useState('');
  const [cultivo, setCultivo] = useState('');
  const [fase, setFase] = useState('');
  const [produccion, setProduccion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [archivoURL, setArchivoURL] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { language } = useLanguage();
  const t = strings[language];
  const isDark = useColorScheme() === 'dark';

  const theme = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#1e1e1e' : '#f0f0f0',
    border: isDark ? '#333' : '#ccc',
  };

  const regionesDisponibles = countryRegionData.find(p => p.country === pais)?.regions || [];
  const listaCultivos = Object.keys(t.crops).map(key => ({ label: t.crops[key], value: key }));
  const fasesDisponibles = Object.keys(t.phaseNames);

  const pickDocumento = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
    if (!result.assets || result.assets.length === 0) {
      Alert.alert('⚠️', 'No se seleccionó ningún archivo');
      return;
    }

    const file = result.assets[0];
    const uri = file.uri;
    const name = file.name;
    const type = file.mimeType || 'application/pdf';

    const formData = new FormData();
    formData.append('archivo', {
      uri,
      name,
      type,
    });

    const response = await fetch('https://upload-server-adhv.onrender.com/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      if (response.ok && data.url) {
        setArchivoURL(data.url);
        Alert.alert('✅ Archivo subido', 'URL generada correctamente');
      } else {
        console.error('❌ Respuesta del servidor (sin error de red pero sin URL):', data);
        Alert.alert('❌', 'Error inesperado del servidor al subir archivo');
      }
    } catch {
      console.error('❌ El servidor no devolvió JSON. Texto recibido:', text);
      Alert.alert('❌', 'El servidor devolvió una respuesta no válida (no es JSON)');
    }

  } catch (error) {
    console.error('❌ Error de red al subir archivo:', error);
    Alert.alert('❌', 'No se pudo conectar con el servidor');
  }
};


  const enviarAsesoramiento = async () => {
    if (!nombre || !correo || !pais || !provincia || !hectareas || !cultivo || !fase || !produccion || !mensaje || !archivoURL) {
      Alert.alert('❗', 'Rellena todos los campos y sube un archivo');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        service_id: 'service_hh6pkhj',
        template_id: 'template_bqcvbzm',
        user_id: 'bi8Pc7GFK1HyfB7nt',
        template_params: {
          nombre,
          email: correo,
          pais,
          provincia,
          hectareas,
          cultivo,
          fase,
          produccion,
          mensaje,
          archivo_url: archivoURL,
        }
      };

      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        Alert.alert('✅', 'Enviado correctamente');
        setNombre('');
        setCorreo('');
        setPais('');
        setProvincia('');
        setHectareas('');
        setCultivo('');
        setFase('');
        setProduccion('');
        setMensaje('');
        setArchivoURL('');
      } else {
        const errorText = await res.text();
        console.error('Error al enviar:', errorText);
        Alert.alert('❌', 'Error al enviar el formulario');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('❌', 'Error inesperado');
    }
    setEnviando(false);
  };

  return (
    <ScrollView style={{ backgroundColor: theme.background }} contentContainerStyle={{ padding: 20 }}>
      <Text style={[styles.label, { color: theme.text }]}>{t.nameQuestion}</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} value={nombre} onChangeText={setNombre} />

      <Text style={[styles.label, { color: theme.text }]}>{t.email}</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} value={correo} onChangeText={setCorreo} keyboardType="email-address" />

      <Text style={[styles.label, { color: theme.text }]}>{t.countryQuestion}</Text>
      <Picker selectedValue={pais} onValueChange={(val) => { setPais(val); setProvincia(''); }} style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}>
        <Picker.Item label="--" value="" />
        {countryRegionData.map(p => (
          <Picker.Item key={p.country} label={traducirPais(p.country, language)} value={p.country} />
        ))}
      </Picker>

      <Text style={[styles.label, { color: theme.text }]}>{t.regionQuestion}</Text>
      <Picker selectedValue={provincia} onValueChange={setProvincia} style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}>
        <Picker.Item label="--" value="" />
        {regionesDisponibles.map(r => (
          <Picker.Item key={r} label={r} value={r} />
        ))}
      </Picker>

      <Text style={[styles.label, { color: theme.text }]}>{t.hectaresQuestion}</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} value={hectareas} onChangeText={setHectareas} keyboardType="decimal-pad" />

      <Text style={[styles.label, { color: theme.text }]}>{t.cropQuestion}</Text>
      <Picker selectedValue={cultivo} onValueChange={setCultivo} style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}>
        <Picker.Item label="--" value="" />
        {listaCultivos.map(item => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>

      <Text style={[styles.label, { color: theme.text }]}>{t.phaseQuestion}</Text>
      <Picker selectedValue={fase} onValueChange={setFase} style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}>
        <Picker.Item label="--" value="" />
        {fasesDisponibles.map(key => (
          <Picker.Item key={key} label={t.phaseNames[key]} value={key} />
        ))}
      </Picker>

      <Text style={[styles.label, { color: theme.text }]}>{t.productionType}</Text>
      <Picker selectedValue={produccion} onValueChange={setProduccion} style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}>
        <Picker.Item label="--" value="" />
        <Picker.Item label={t.conventional} value="Convencional" />
        <Picker.Item label={t.organic} value="Ecológica" />
      </Picker>

      <Text style={[styles.label, { color: theme.text }]}>¿Qué ocurre?</Text>
      <TextInput
        value={mensaje}
        onChangeText={setMensaje}
        multiline
        numberOfLines={4}
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, height: 100 }]}
        placeholder="Describe el problema o necesidad"
      />

      <TouchableOpacity onPress={pickDocumento} style={[styles.boton, { backgroundColor: '#FF8800' }]}>
        <Text style={styles.botonTexto}>
          {archivoURL ? '✅ Archivo subido' : '📎 Subir archivo (imagen o PDF)'}
        </Text>
      </TouchableOpacity>

      {enviando && <ActivityIndicator size="large" color="#007bff" style={{ marginVertical: 20 }} />}

      <TouchableOpacity onPress={enviarAsesoramiento} disabled={enviando} style={[styles.boton, { backgroundColor: enviando ? '#999' : '#1c4c25' }]}>
        <Text style={styles.botonTexto}>Enviar solicitud</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 16, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 15,
  },
  boton: {
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  botonTexto: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
