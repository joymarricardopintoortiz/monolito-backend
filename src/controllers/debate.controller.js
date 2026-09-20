const config = require('../config/config');
const debateService = require('../services/debate.service');
const logger = require('../utils/logger');

async function recibirWebhook(req, res, next) {
  try {
    const { message, turn = 1 } = req.body;
    logger.info(`Turno ${turn} recibido: ${message}`);

    const respuesta = await debateService.procesarMensajeEntrante(message, turn);
    logger.info(`Turno ${turn} respondido: ${respuesta}`);

    res.json({ reply: respuesta, turn });

    if (turn < config.maxTurns) {
      try {
        await debateService.enviarAlOponente(respuesta, turn + 1);
      } catch (errReenvio) {
        logger.error(`Fallo reenviando al oponente: ${errReenvio.message}`);
      }
    } else {
      logger.info('Debate finalizado, máximo de turnos alcanzado.');
    }
  } catch (err) {
    next(err);
  }
}

async function iniciarDebate(req, res, next) {
  try {
    const { message } = req.body;
    debateService.registrarMensajePropio(message);
    logger.info(`Debate iniciado con mensaje: ${message}`);

    res.json({ ok: true });

    try {
      await debateService.enviarAlOponente(message, 1);
    } catch (errReenvio) {
      logger.error(`Fallo reenviando al oponente: ${errReenvio.message}`);
    }
  } catch (err) {
    next(err);
  }
}

function obtenerHistorial(req, res) {
  res.json(debateService.getHistory());
}

function reiniciarDebate(req, res) {
  debateService.resetHistory();
  res.json({ ok: true });
}

module.exports = {
  recibirWebhook,
  iniciarDebate,
  obtenerHistorial,
  reiniciarDebate,
};