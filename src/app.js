const express = require('express');
const path = require('path');
const debateRoutes = require('./routes/debate.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/api', debateRoutes);
app.use(errorHandler);

module.exports = app;