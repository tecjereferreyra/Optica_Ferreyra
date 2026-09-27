const pedidosService = require("../services/pedidos.service");

const CRISTALES_VALIDOS = ["Monofocal", "Bifocal", "Progresivo", "Sol"];

// GET /api/pedidos
async function listarPedidos(req, res) {
  const pedidos = await pedidosService.listarPedidos();
  res.json(pedidos);
}

// GET /api/armazones
async function listarArmazones(req, res) {
  const armazones = await pedidosService.listarArmazones();
  res.json(armazones);
}

// POST /api/pedidos
async function crearPedido(req, res) {
  const { cliente, telefono, idArmazon, tipoCristal, precioTotal } = req.body;

  // Las validaciones de FORMA siguen siendo tarea del controlador
  if (!cliente || cliente.trim() === "") {
    return res.status(400).json({ mensaje: "El nombre del cliente es obligatorio." });
  }
  if (!idArmazon || Number.isNaN(Number(idArmazon))) {
    return res.status(400).json({ mensaje: "Debe elegir un armazón válido." });
  }
  if (!CRISTALES_VALIDOS.includes(tipoCristal)) {
    return res.status(400).json({ mensaje: "El tipo de cristal no es válido." });
  }
  if (Number.isNaN(Number(precioTotal)) || Number(precioTotal) <= 0) {
    return res.status(400).json({ mensaje: "El precio total debe ser mayor a cero." });
  }

  const idPedido = await pedidosService.crear({
    cliente: cliente.trim(),
    telefono: (telefono || "").trim(),
    idArmazon: Number(idArmazon),
    tipoCristal,
    precioTotal: Number(precioTotal)
  });

  res.status(201).json({ idPedido, mensaje: `Pedido N° ${idPedido} registrado.` });
}

// PUT /api/pedidos/:id/avanzar  (Encargado -> Listo -> Entregado)
async function avanzarPedido(req, res) {
  const idPedido = Number(req.params.id);

  if (Number.isNaN(idPedido)) {
    return res.status(400).json({ mensaje: "El id del pedido debe ser numérico." });
  }

  await pedidosService.avanzar(idPedido);
  res.json({ mensaje: `Pedido N° ${idPedido} avanzó de estado.` });
}

module.exports = { listarPedidos, listarArmazones, crearPedido, avanzarPedido };