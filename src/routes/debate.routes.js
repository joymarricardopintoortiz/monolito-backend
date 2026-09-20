const express = require('express');
const debateController = require('../controllers/debate.controller');

const router = express.Router();

router.post('/webhook', debateController.recibirWebhook);
router.post('/start', debateController.iniciarDebate);
router.get('/history', debateController.obtenerHistorial);
router.post('/reset', debateController.reiniciarDebate);

module.exports = router;