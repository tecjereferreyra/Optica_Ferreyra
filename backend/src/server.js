const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../.env") });

const logger = require("./middlewares/logger");
const { manejadorErrores, rutaNoEncontrada } = require("./middlewares/errores");
const pedidosRoutes = require("./routes/pedidos.routes");
const saludRoutes = require("./routes/salud.routes");

const app = express();

app.use(cors());  
app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.send("API Óptica La Mirada funcionando");
});

app.use("/api", pedidosRoutes);
app.use("/api", saludRoutes);

// Ninguna ruta atendió la petición -> 404 prolijo en JSON
app.use(rutaNoEncontrada);

// El manejador de errores SIEMPRE se monta último
app.use(manejadorErrores);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});