import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useColorScheme } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { strings } from '../strings';

const GlosarioScreen = () => {
  const { language } = useLanguage();
  const t = strings[language];
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const theme = {
    background: isDark ? '#121212' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    card: isDark ? '#1e1e1e' : '#f0f0f0',
    border: isDark ? '#333' : '#ccc',
  };

  const glosario = [
    {
      key: 'vegetativo',
      description: language === 'es'
        ? 'Etapa inicial centrada en el desarrollo de hojas, raíces y tallos.'
        : 'Initial stage focused on leaves, roots, and stems.',
      image: language === 'es'
        ? require('../../assets/vegetativo.png')
        : require('../../assets/vegetative.png'),
    },
    {
      key: 'enraizamiento',
      description: language === 'es'
        ? 'Fase donde la planta desarrolla nuevas raíces para anclarse y absorber agua.'
        : 'Stage where the plant develops roots to anchor and absorb water.',
      image: language === 'es'
        ? require('../../assets/enraizamiento.png')
        : require('../../assets/rooting.png'),
    },
    {
      key: 'floracion',
      description: language === 'es'
        ? 'Aparición y desarrollo de flores, clave para la producción de frutos.'
        : 'Development of flowers, crucial for fruit production.',
      image: language === 'es'
        ? require('../../assets/floracion.png')
        : require('../../assets/flowering.png'),
    },
    {
      key: 'cuajado',
      description: language === 'es'
        ? 'Conversión de la flor en fruto. Etapa muy delicada.'
        : 'Transformation of flower into fruit. Very delicate stage.',
      image: language === 'es'
        ? require('../../assets/cuajado.png')
        : require('../../assets/setting.png'),
    },
    {
      key: 'engorde',
      description: language === 'es'
        ? 'Fase en la que el fruto aumenta de tamaño.'
        : 'Stage where the fruit grows in size.',
      image: language === 'es'
        ? require('../../assets/engorde.png')
        : require('../../assets/enlarging.png'),
    },
    {
      key: 'maduracion',
      description: language === 'es'
        ? 'Fase final del fruto, donde adquiere color, sabor y aroma.'
        : 'Final stage of the fruit with color, taste, and aroma development.',
      image: language === 'es'
        ? require('../../assets/maduracion.png')
        : require('../../assets/maturing.png'),
    },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ padding: 20 }}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.text, marginBottom: 20 }}>
        {language === 'es' ? 'Glosario de Fases Agrícolas' : 'Glossary of Agricultural Phases'}
      </Text>

      {glosario.map((item) => (
        <View
          key={item.key}
          style={{
            backgroundColor: theme.card,
            padding: 15,
            borderRadius: 10,
            marginBottom: 15,
            borderColor: theme.border,
            borderWidth: 1,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <Image
            source={item.image}
            style={{ width: 50, height: 50, resizeMode: 'contain' }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16, color: theme.text }}>
              {t.glossaryPhaseNames?.[item.key] || item.key}
            </Text>
            <Text style={{ color: theme.text, marginTop: 4 }}>{item.description}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default GlosarioScreen;
