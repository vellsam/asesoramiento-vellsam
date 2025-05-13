import axios from 'axios';
import { strings } from '../strings';
import { language } from '../context/staticLanguage';

export const enviarCorreoConRecomendaciones = async ({ nombre, email, recomendaciones }) => {
  const t = strings[language];

  const productosHTML = recomendaciones.map((prod) => `
    <tr style="border-bottom: 1px solid #e0e0e0;">
      <td style="padding: 16px;">
        <h3 style="margin: 0 0 8px 0; color: #1c4c25; font-size: 18px;">${prod.nombre}</h3>
        ${prod.rad ? `<p style="margin: 4px 0; font-size: 14px;">${t.phaseNames.RAD || 'Dosis radicular'}: ${prod.rad} L/Ha</p>` : ''}
        ${prod.url ? `<a href="${prod.url}" style="color: #ff8c00; font-size: 14px;">${t.seePolicy}</a>` : ''}
      </td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${t.productsRecommended}</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .logo {
          width: 60%;
          max-width: 250px;
        }
        .footer {
          margin-top: 30px;
          font-size: 13px;
          text-align: center;
          color: #888;
        }
        @media only screen and (max-width: 600px) {
          .container { padding: 16px; }
          h2 { font-size: 20px; }
          h3 { font-size: 16px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img class="logo" src="https://i.postimg.cc/MfSbK1Bt/vellsaminicio.png" alt="Vellsam Logo" />
          <h2 style="color: #1c4c25;">${t.productsRecommended}</h2>
        </div>
        <p>${t.thankYou} <strong>${nombre}</strong>,</p>
        <p>${t.viewRecommendations}:</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
          ${productosHTML}
        </table>
        <p>${t.acceptStorage}</p>
        <div class="footer">
          🌱 Vellsam
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await axios.post('https://api.resend.com/emails', {
      from: 'asistente@vellsam.com',
      to: [email],
      subject: t.productsRecommended,
      html: htmlContent,
    }, {
      headers: {
        Authorization: `Bearer re_bKrZHKj4_EtHzwU5ULWY4xef1wiZEFuSe`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Correo enviado a', email);
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
  }
};
export const enviarCorreoSinRecomendaciones = async ({ nombre, email }) => {
  const t = strings[language];

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${t.productsRecommended}</title>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f6f6f6;
          margin: 0;
          padding: 0;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
        }
        .header {
          text-align: center;
          padding-bottom: 20px;
        }
        .logo {
          width: 60%;
          max-width: 250px;
        }
        .footer {
          margin-top: 30px;
          font-size: 13px;
          text-align: center;
          color: #888;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img class="logo" src="https://i.postimg.cc/MfSbK1Bt/vellsaminicio.png" alt="Vellsam Logo">
          <h2 style="color: #1c4c25;">
            ${t.thankYou}, ${nombre}
          </h2>
        </div>
        <p>
          ${
            language === 'en'
              ? "Thank you for using the Vellsam Assistant. We currently have no automatic recommendations for your crop and phase."
              : "Gracias por utilizar el Asistente Vellsam. Actualmente no tenemos recomendaciones automáticas para tu cultivo y fase."
          }
        </p>
        <p>
          ${
            language === 'en'
              ? "Our technical team will review your case and contact you soon."
              : "Nuestro equipo técnico revisará tu caso y se pondrá en contacto contigo en breve."
          }
        </p>
        <p>
          ${
            language === 'en'
              ? 'You can also contact us directly at'
              : 'También puedes escribirnos directamente a'
          } <a href="mailto:vellsam@vellsam.com">vellsam@vellsam.com</a>.
        </p>
        <div class="footer">
          🌱 Vellsam
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await axios.post('https://api.resend.com/emails', {
      from: 'asistente@vellsam.com',
      to: [email],
      subject: t.productsRecommended,
      html: htmlContent,
    }, {
      headers: {
        Authorization: `Bearer re_bKrZHKj4_EtHzwU5ULWY4xef1wiZEFuSe`,
        'Content-Type': 'application/json',
      },
    });

    console.log('📨 Correo sin recomendaciones enviado a', email);
  } catch (error) {
    console.error('❌ Error al enviar el correo sin recomendaciones:', error);
  }
};

