const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");

router.post("/create", itemController.create);
router.get("/getall", itemController.getall);
router.get("/getbyid", itemController.getbyid);
router.put("/update", itemController.update);
router.delete("/delete", itemController.delete);

module.exports = router;