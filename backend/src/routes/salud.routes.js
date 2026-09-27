const { Router } = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const saludController = require("../controllers/salud.controller");

const router = Router();

router.get("/salud", asyncHandler(saludController.estadosalud));


module.exports = router;