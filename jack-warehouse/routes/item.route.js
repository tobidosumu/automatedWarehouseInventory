const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");

router.post("/create", itemController.createitem);
router.get("/getAll", itemController.getallitem);
router.get("/getbyId", itemController.getbyIditem);
router.put("/update", itemController.updateitem);
router.delete("/delete", itemController.deleteitem);
module.exports = router;
