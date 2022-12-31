const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");
const itemModel = require("../models/item.model");

router.post("/create", itemController.create);
router.get("/getall", itemController.getall);
router.get("/getbyid/:id", itemController.getbyid);
router.patch("/update/:id", itemController.update);
router.delete("/delete/:id", itemController.delete);

router.get("/gettotalweight", itemController.getTotalWeight);
router.get("/averageweight/:row", itemController.getAverageWeight);
router.get("/emptyrows", itemController.getEmptyRows);
router.get("/rowcapacity/:row", itemController.getRowCapacity);
router.get("/row/:row", itemController.getItemsInRow);
router.get("/getbyname/:name", itemController.getbyname);
router.get("/find_expiring_items", itemController.findExpiringItems);
router.get("/get_items_by_tag/:tag", itemController.getItemsByTag);

module.exports = router;