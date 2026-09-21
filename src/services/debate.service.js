const config = require('../config/config');
const Message = require('../models/message.model');
const openrouterService = require('./openrouter.service');

let history = [];

function getHistory() {
  return history;
}

function resetHistory() {
  history = [];
}

async function procesarMensajeEntrante(mensajeTexto, turno) {
  history.push(new Message('user', mensajeTexto, turno));

  const mensajesParaApi = history.map((m) => ({ role: m.role, content: m.content }));
  const respuesta = await openrouterService.pedirRespuesta(mensajesParaApi);

  history.push(new Message('assistant', respuesta, turno));
  return respuesta;
}

function registrarMensajePropio(mensajeTexto) {
  history.push(new Message('assistant', mensajeTexto, 0));
}

async function enviarAlOponente(mensajeTexto, turno, intento = 1) {
  if (!config.opponentUrl) {
    return { enviado: false, motivo: 'OPPONENT_URL no configurado' };
  }

  const maxIntentos = 6;
  const esperaMs = 10000;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    await fetch(`${config.opponentUrl}/api/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: mensajeTexto, turn: turno }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return { enviado: true };
  } catch (err) {
    if (intento < maxIntentos) {
      await new Promise((resolve) => setTimeout(resolve, esperaMs));
      return enviarAlOponente(mensajeTexto, turno, intento + 1);
    }
    throw err;
  }
}

module.exports = {
  getHistory,
  resetHistory,
  procesarMensajeEntrante,
  registrarMensajePropio,
  enviarAlOponente,
};
