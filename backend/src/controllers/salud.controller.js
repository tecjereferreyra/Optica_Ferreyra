
// GET /api/salud
async function estadosalud(req, res) {
  const horaServidor = new Date().toISOString();

  res.json({ estado: "ok", horaServidor });
}

module.exports = { estadosalud };