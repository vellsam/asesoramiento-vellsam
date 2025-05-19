import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';

export default function ResumenScreen({ route, navigation }) {
  const { datosFormulario } = route.params;

  const handleConfirmar = () => {
    navigation.navigate('Asistente', { enviar: true, datosFormulario });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Resumen de Datos</Text>

      {Object.entries(datosFormulario).map(([clave, valor]) => (
        <View key={clave} style={styles.dato}>
          <Text style={styles.label}>{clave}:</Text>
          <Text style={styles.valor}>{valor}</Text>
        </View>
      ))}

      <View style={styles.botonera}>
        <Button title="Editar" onPress={() => navigation.goBack()} />
        <Button title="Confirmar y Enviar" onPress={handleConfirmar} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  dato: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  valor: {
    fontSize: 16,
    marginTop: 4,
  },
  botonera: {
    marginTop: 30,
    gap: 15,
  },
});
