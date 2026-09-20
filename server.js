const app = require('./src/app');
const config = require('./src/config/config');

app.listen(config.port, () => {
  console.log(`Backend MONOLITO escuchando en http://localhost:${config.port}`);
});