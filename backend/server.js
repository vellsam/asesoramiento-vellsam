const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');
const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3000;

// Resend
const resend = new Resend('re_FzGG9isV_KMHwaS4rxqHyJkpt9qT6Eg3y');

// Cloudinary config
cloudinary.config({
  cloud_name: 'dzsoe6a11',
  api_key: '651521433295891',
  api_secret: 'kmoW-Tjeqrq-82juk9PD-tG2d4w',
});

// Middleware
app.use(cors());
app.use(express.json());

// Multer memory storage (no guarda en disco)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor de subida con Cloudinary activo');
});

// Subida de archivo a Cloudinary
app.post('/upload', upload.single('archivo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se envió ningún archivo' });
    }

    const mime = req.file.mimetype;
    const isImage = mime.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'vellsam', resource_type: resourceType },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      bufferStream.pipe(stream);
    });

    res.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error('Error al subir a Cloudinary:', error);
    res.status(500).json({ error: 'Error al subir archivo a Cloudinary' });
  }
});


// Envío de correo
app.post('/enviar-correo', async (req, res) => {
  const {
    nombre,
    email,
    pais,
    provincia,
    hectareas,
    cultivo,
    fase,
    produccion,
    mensaje,
    archivo_url
  } = req.body;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Asistente Vellsam <asistente@vellsam.com>',
      to: ['adurillo@vellsam.com'],
      subject: '📥 Nueva solicitud de asesoramiento',
      html: `
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>País:</strong> ${pais}</p>
        <p><strong>Provincia:</strong> ${provincia}</p>
        <p><strong>Hectáreas:</strong> ${hectareas}</p>
        <p><strong>Cultivo:</strong> ${cultivo}</p>
        <p><strong>Fase:</strong> ${fase}</p>
        <p><strong>Producción:</strong> ${produccion}</p>
        <p><strong>Mensaje:</strong> ${mensaje}</p>
        <p><strong>Archivo:</strong> <a href="${archivo_url}">${archivo_url}</a></p>
      `,
    });

    if (error) {
      console.error('❌ Error al enviar correo:', error);
      return res.status(500).json({ error: 'Error al enviar correo' });
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('💥 Error interno:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
