export const paisesTraducidos = {
  es: {
    "United States": "Estados Unidos",
    "United Kingdom": "Reino Unido",
    "Germany": "Alemania",
    "France": "Francia",
    "Italy": "Italia",
    "Canada": "Canadá",
    "Mexico": "México",
    "Spain": "España",
    "Argentina": "Argentina",
    "Brazil": "Brasil",
    "Colombia": "Colombia",
    "Chile": "Chile",
    "Peru": "Perú",
    "Australia": "Australia",
    "China": "China",
    "Japan": "Japón",
    "South Korea": "Corea del Sur",
    "India": "India",
    "Netherlands": "Países Bajos",
    "Belgium": "Bélgica",
    "Switzerland": "Suiza",
    "Sweden": "Suecia",
    "Norway": "Noruega",
    "Denmark": "Dinamarca",
    "Ireland": "Irlanda",
    "Poland": "Polonia",
    "Russia": "Rusia",
    "South Africa": "Sudáfrica",
    "Turkey": "Turquía",
    "New Zealand": "Nueva Zelanda",
    "Portugal": "Portugal",
    "Ukraine": "Ucrania",
    "Greece": "Grecia",
    "Egypt": "Egipto",
    "Morocco": "Marruecos"
  },
  en: {
    "Estados Unidos": "United States",
    "Reino Unido": "United Kingdom",
    "Alemania": "Germany",
    "Francia": "France",
    "Italia": "Italy",
    "Canadá": "Canada",
    "México": "Mexico",
    "España": "Spain",
    "Argentina": "Argentina",
    "Brasil": "Brazil",
    "Colombia": "Colombia",
    "Chile": "Chile",
    "Perú": "Peru",
    "Australia": "Australia",
    "China": "China",
    "Japón": "Japan",
    "Corea del Sur": "South Korea",
    "India": "India",
    "Países Bajos": "Netherlands",
    "Bélgica": "Belgium",
    "Suiza": "Switzerland",
    "Suecia": "Sweden",
    "Noruega": "Norway",
    "Dinamarca": "Denmark",
    "Irlanda": "Ireland",
    "Polonia": "Poland",
    "Rusia": "Russia",
    "Sudáfrica": "South Africa",
    "Turquía": "Turkey",
    "Nueva Zelanda": "New Zealand",
    "Portugal": "Portugal",
    "Ucrania": "Ukraine",
    "Grecia": "Greece",
    "Egipto": "Egypt",
    "Marruecos": "Morocco"
  }
};

export const traducirPais = (pais, idioma) => {
  return paisesTraducidos[idioma]?.[pais] || pais;
};
