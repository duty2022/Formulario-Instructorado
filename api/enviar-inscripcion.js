// Función serverless de Vercel: recibe los datos del formulario y envía
// un email de notificación usando Resend (resend.com).
//
// Configuración necesaria en Vercel:
// 1. Crear una cuenta gratis en resend.com con eidarte@hotmail.com
// 2. Generar una API Key en resend.com/api-keys
// 3. En el proyecto de Vercel: Settings > Environment Variables
//    agregar RESEND_API_KEY con el valor de esa clave

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Método no permitido" });
  }

  const {
    nombre,
    apellido,
    documento,
    curso,
    ciudad,
    whatsapp_pais,
    whatsapp_numero,
    email,
    experiencia,
    tiene_cupon,
    numero_cupon
  } = req.body || {};

  if (!nombre || !apellido || !documento || !curso || !ciudad || !whatsapp_pais || !whatsapp_numero || !email || !experiencia || !tiene_cupon) {
    return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
  }

  const lineaCupon = tiene_cupon === "Sí"
    ? `<p><strong>Cupón de descuento:</strong> Sí — Nº ${numero_cupon || "(no indicado)"}</p>`
    : `<p><strong>Cupón de descuento:</strong> No</p>`;

  try {
    const respuesta = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Inscripciones EIB <onboarding@resend.dev>",
        to: ["eidarte@hotmail.com"],
        subject: "Nueva inscripción al instructorado",
        html: `
          <h2>Nueva inscripción</h2>
          <p><strong>Nombre:</strong> ${nombre} ${apellido}</p>
          <p><strong>Documento de identidad:</strong> ${documento}</p>
          <p><strong>Curso:</strong> ${curso}</p>
          <p><strong>Ciudad:</strong> ${ciudad}</p>
          <p><strong>WhatsApp:</strong> ${whatsapp_pais} ${whatsapp_numero}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Experiencia previa en baile o fitness:</strong><br>${experiencia}</p>
          ${lineaCupon}
        `
      })
    });

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error(detalle);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
