const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ API KEY de Resend (usa tu clave nueva)
const resend = new Resend('re_FzGG9isV_KMHwaS4rxqHyJkpt9qT6Eg3y');

// ✅ Crear carpeta uploads si no existe
const uploadDir = path.join(__dirname, 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

// ✅ Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const baseName = path.parse(file.originalname).name;
    const ext = path.extname(file.originalname);

    const sanitizedName = baseName
      .normalize('NFD') // descompone letras con tilde
      .replace(/[\u0300-\u036f]/g, '') // elimina tildes
      .replace(/\s+/g, '_') // reemplaza espacios
      .replace(/[^\w\-]/g, ''); // elimina cualquier otro caracter raro

    const finalName = `${Date.now()}-${sanitizedName}${ext}`;
    cb(null, finalName);
  },
});

const upload = multer({ storage });

// ✅ Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor de subida activo');
});

// ✅ Subida de archivos
app.post('/upload', upload.single('archivo'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ✅ Envío de correo con Resend
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
      from: 'Asistente Vellsam <asistente@vellsam.com>', // Asegúrate de que esté verificado
      to: ['adurillo@vellsam.com'], // ✅ Aquí se enviarán todos los formularios
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

// ✅ Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
