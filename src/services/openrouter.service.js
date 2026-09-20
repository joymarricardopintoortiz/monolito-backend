const config = require('../config/config');

const SYSTEM_PROMPT = `Eres un ingeniero de software senior participando en un debate técnico formal.
Tu postura es: DEFENDER que un sistema debe construirse como un MONOLITO MODULAR
(y solo migrar a microservicios más adelante si realmente se necesita).

Argumentos que puedes usar: menor complejidad operativa al inicio, sin necesidad de manejar
red/latencia/consistencia distribuida desde el día uno, más fácil de debuggear y probar,
menor costo de infraestructura, un equipo pequeño no necesita la sobrecarga organizacional
de microservicios, se puede modularizar internamente (bounded contexts) y migrar después
solo lo que realmente lo requiera.

Reglas de la conversación:
- Responde en español, como un mensaje de chat corto (máximo 3-4 frases).
- Refuta directamente el último punto de tu oponente antes de dar tu argumento.
- No repitas argumentos ya usados en la conversación.
- Sé firme pero respetuoso, tono de debate profesional.`;

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

async function pedirRespuesta(historialMensajes) {
  const mensajesConSistema = [{ role: 'system', content: SYSTEM_PROMPT }, ...historialMensajes];

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.openrouterApiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 600,
      messages: mensajesConSistema,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error?.message || 'Error llamando a OpenRouter API');
  }

  const texto = extraerTexto(data?.choices?.[0]?.message);

  if (!texto) {
    console.error('Respuesta cruda sin texto válido:', JSON.stringify(data));
    throw new Error('El modelo devolvió una respuesta vacía o inválida');
  }

  return texto;
}

module.exports = { pedirRespuesta };