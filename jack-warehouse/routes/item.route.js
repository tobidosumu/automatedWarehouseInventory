const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");

router.post("/create", itemController.create);
router.get("/getall", itemController.getall);
router.get("/getbyid/:id", itemController.getbyid);
router.patch("/update/:id", itemController.update);
router.delete("/delete/:id", itemController.delete);

router.get("/gettotalweight", itemController.getTotalWeight);
router.get("/averageweight/:row", itemController.getAverageWeight);

module.exports = router;