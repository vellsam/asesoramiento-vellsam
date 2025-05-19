const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpeta 'uploads' con seguridad
const uploadDir = path.join(__dirname, 'uploads');
try {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Carpeta /uploads lista');
} catch (err) {
  console.error('❌ Error al crear carpeta uploads:', err);
}

app.use(cors());
app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const sanitized = file.originalname.replace(/\s+/g, '_');
    const uniqueName = Date.now() + '-' + sanitized;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.send('Servidor de subida activo');
});

app.post('/upload', upload.single('archivo'), (req, res) => {
  try {
    console.log('📥 Recibiendo archivo...');
    if (!req.file) {
      console.error('❌ req.file está vacío');
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('✅ Archivo guardado en:', fileUrl);
    res.json({ url: fileUrl });
  } catch (error) {
    console.error('💥 Error interno en /upload:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
