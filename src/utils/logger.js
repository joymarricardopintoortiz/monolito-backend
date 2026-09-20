function info(mensaje) {
  console.log(`[MONOLITO] ${mensaje}`);
}

function error(mensaje) {
  console.error(`[MONOLITO][ERROR] ${mensaje}`);
}

module.exports = { info, error };