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

  const [paisLocked, setPaisLocked] = useState(false);
  const [provinciaLocked, setProvinciaLocked] = useState(false);
  const [cultivoLocked, setCultivoLocked] = useState(false);
  const [faseLocked, setFaseLocked] = useState(false);
  const [produccionLocked, setProduccionLocked] = useState(false);

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

  const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  const validarNombre = (nombre) => /^[a-zA-ZÁÉÍÓÚáéíóúÑñ\s'-]+$/.test(nombre.trim());
  const validarHectareas = (valor) => {
    const num = parseFloat(valor.replace(',', '.'));
    return !isNaN(num) && num > 0;
  };

 const [subiendoArchivo, setSubiendoArchivo] = useState(false);

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
    formData.append('archivo', { uri, name, type });

    setSubiendoArchivo(true); // ✅ empieza carga

    const response = await fetch('https://asesoramiento-vellsam.onrender.com/upload', {
      method: 'POST',
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      if (response.ok && data.url) {
        setArchivoURL(data.url);
        Alert.alert('✅ Archivo subido', 'URL generada correctamente');
      } else {
        console.error('❌ Respuesta del servidor:', data);
        Alert.alert('❌', 'Error inesperado del servidor al subir archivo');
      }
    } catch {
      console.error('❌ El servidor no devolvió JSON:', text);
      Alert.alert('❌', 'La respuesta del servidor no es válida');
    }
  } catch (error) {
    console.error('❌ Error al subir archivo:', error);
    Alert.alert('❌', 'No se pudo conectar con el servidor');
  }

  setSubiendoArchivo(false); // ✅ finaliza carga
};


  const enviarAsesoramiento = async () => {
    if (!nombre || !correo || !pais || !provincia || !hectareas || !cultivo || !fase || !produccion || !mensaje || !archivoURL) {
      Alert.alert('❗', 'Rellena todos los campos y sube un archivo');
      return;
    }

    if (!validarCorreo(correo)) {
      Alert.alert('❌', 'Introduce un correo válido');
      return;
    }

    if (!validarNombre(nombre)) {
      Alert.alert('❌', 'El nombre no es válido');
      return;
    }

    if (!validarHectareas(hectareas)) {
      Alert.alert('❌', 'Introduce un número válido de hectáreas');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
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
      };

      // Enviar correo
      await fetch('https://asesoramiento-vellsam.onrender.com/enviar-correo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Guardar en Sheety
      await fetch('https://api.sheety.co/50910ab5d9fcb816bfcd3ad8a1bb2169/datosAsesoramiento/datos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dato: { ...payload, fecha: new Date().toISOString() } }),
      });

      Alert.alert('✅', 'Solicitud enviada correctamente');
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
    } catch (err) {
      console.error('❌ Error al enviar:', err);
      Alert.alert('❌', 'Error al enviar la solicitud');
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
      <Picker
        selectedValue={pais}
        onValueChange={(val) => { setPais(val); setProvincia(''); setPaisLocked(val !== ''); }}
        enabled={!paisLocked}
        style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}
      >
        <Picker.Item label="--" value="" />
        {countryRegionData.map(p => (
          <Picker.Item key={p.country} label={traducirPais(p.country, language)} value={p.country} />
        ))}
      </Picker>
      {pais && paisLocked && (
        <TouchableOpacity onPress={() => setPaisLocked(false)}>
          <Text style={{ color: '#66aaff' }}>✏️ Editar país</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.label, { color: theme.text }]}>{t.regionQuestion}</Text>
      <Picker
        selectedValue={provincia}
        onValueChange={(val) => { setProvincia(val); setProvinciaLocked(val !== ''); }}
        enabled={!provinciaLocked}
        style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}
      >
        <Picker.Item label="--" value="" />
        {regionesDisponibles.map(r => (
          <Picker.Item key={r} label={r} value={r} />
        ))}
      </Picker>
      {provincia && provinciaLocked && (
        <TouchableOpacity onPress={() => setProvinciaLocked(false)}>
          <Text style={{ color: '#66aaff' }}>✏️ Editar provincia</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.label, { color: theme.text }]}>{t.hectaresQuestion}</Text>
      <TextInput style={[styles.input, { backgroundColor: theme.card, color: theme.text }]} value={hectareas} onChangeText={setHectareas} keyboardType="decimal-pad" />

      <Text style={[styles.label, { color: theme.text }]}>{t.cropQuestion}</Text>
      <Picker
        selectedValue={cultivo}
        onValueChange={(val) => { setCultivo(val); setCultivoLocked(val !== ''); }}
        enabled={!cultivoLocked}
        style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}
      >
        <Picker.Item label="--" value="" />
        {listaCultivos.map(item => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
      {cultivo && cultivoLocked && (
        <TouchableOpacity onPress={() => setCultivoLocked(false)}>
          <Text style={{ color: '#66aaff' }}>✏️ Editar cultivo</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.label, { color: theme.text }]}>{t.phaseQuestion}</Text>
      <Picker
        selectedValue={fase}
        onValueChange={(val) => { setFase(val); setFaseLocked(val !== ''); }}
        enabled={!faseLocked}
        style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}
      >
        <Picker.Item label="--" value="" />
        {fasesDisponibles.map(key => (
          <Picker.Item key={key} label={t.phaseNames[key]} value={key} />
        ))}
      </Picker>
      {fase && faseLocked && (
        <TouchableOpacity onPress={() => setFaseLocked(false)}>
          <Text style={{ color: '#66aaff' }}>✏️ Editar fase</Text>
        </TouchableOpacity>
      )}

      <Text style={[styles.label, { color: theme.text }]}>{t.productionType}</Text>
      <Picker
        selectedValue={produccion}
        onValueChange={(val) => { setProduccion(val); setProduccionLocked(val !== ''); }}
        enabled={!produccionLocked}
        style={[styles.picker, { backgroundColor: theme.card, color: theme.text }]}
      >
        <Picker.Item label="--" value="" />
        <Picker.Item label={t.conventional} value="Convencional" />
        <Picker.Item label={t.organic} value="Ecológica" />
      </Picker>
      {produccion && produccionLocked && (
        <TouchableOpacity onPress={() => setProduccionLocked(false)}>
          <Text style={{ color: '#66aaff' }}>✏️ Editar tipo</Text>
        </TouchableOpacity>
      )}

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
        {subiendoArchivo && <ActivityIndicator size="small" color="#FF8800" style={{ marginTop: 10 }} />}

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
