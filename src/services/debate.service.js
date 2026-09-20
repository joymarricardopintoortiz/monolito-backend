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

async function enviarAlOponente(mensajeTexto, turno) {
  if (!config.opponentUrl) {
    return { enviado: false, motivo: 'OPPONENT_URL no configurado' };
  }

  await fetch(`${config.opponentUrl}/api/webhook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: mensajeTexto, turn: turno }),
  });

  return { enviado: true };
}

module.exports = {
  getHistory,
  resetHistory,
  procesarMensajeEntrante,
  registrarMensajePropio,
  enviarAlOponente,
};