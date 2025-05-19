const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Crear carpeta 'uploads' si no existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ✅ Middleware
app.use(cors());
app.use('/uploads', express.static(uploadDir));

// ✅ Configurar Multer
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

// ✅ Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor de subida activo');
});

// ✅ Ruta de subida de archivos
app.post('/upload', upload.single('archivo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ✅ Escuchar en el puerto asignado por Render
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
