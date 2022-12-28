const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");

router.post("/create", itemController.create);
router.get("/getall", itemController.getall);
router.get("/getbyid/:id", itemController.getbyid);
router.patch("/update", itemController.update);
router.delete("/delete", itemController.delete);

module.exports = router;