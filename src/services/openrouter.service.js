const config = require('../config/config');

const SYSTEM_PROMPT = `Eres un ingeniero de software senior participando en un debate técnico formal.
Tu postura es: DEFENDER que un sistema debe construirse con MICROSERVICIOS DESDE EL INICIO
(no empezar con monolito y migrar después).

Argumentos que puedes usar: escalabilidad independiente de cada componente, despliegues
independientes sin bloquear al resto del equipo, aislamiento de fallos, libertad tecnológica
por servicio, equipos autónomos y organizados por dominio (Conway), preparación temprana
para crecimiento sin necesidad de una migración costosa después.

Reglas de la conversación:
- Responde en español, como un mensaje de chat corto (máximo 3-4 frases).
- Refuta directamente el último punto de tu oponente antes de dar tu argumento.
- No repitas argumentos ya usados en la conversación.
- Sé firme pero respetuoso, tono de debate profesional.`;

const MODELOS = [
  'google/gemini-2.5-flash',
];

function extraerTexto(mensaje) {
  if (!mensaje) return null;
  const contenido = mensaje.content;
  if (typeof contenido === 'string' && contenido.trim().length > 0) {
    return contenido.trim();
  }
  if (Array.isArray(contenido)) {
    const texto = contenido
      .filter((parte) => parte && parte.type === 'text' && typeof parte.text === 'string')
      .map((parte) => parte.text)
      .join('\n')
      .trim();
    if (texto.length > 0) return texto;
  }
  return null;
}

async function llamarModelo(modelo, mensajes) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openrouterApiKey}`,
    },
    body: JSON.stringify({
      model: modelo,
      max_tokens: 800,
      messages: mensajes,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`Error crudo de OpenRouter con ${modelo}: `, JSON.stringify(data));
    return null;
  }

  return extraerTexto(data?.choices?.[0]?.message);
}

async function pedirRespuesta(historialMensajes) {
  const mensajeConSistema = [{ role: 'system', content: SYSTEM_PROMPT }, ...historialMensajes];

  for (const modelo of MODELOS) {
    const texto = await llamarModelo(modelo, mensajeConSistema);
    if (texto) return texto;
  }

  throw new Error('Ningun modelo devolvio una respuesta valida');
}

module.exports = { pedirRespuesta };
