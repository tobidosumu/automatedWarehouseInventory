const express = require("express");
const router = express.Router();
const itemController = require("../controllers/item.controller");

// For handling CRUD operations
router.post("/create", itemController.create);
router.get("/getall", itemController.getall);
router.get("/getbyid/:id", itemController.getbyid);
router.patch("/update/:id", itemController.update);
router.delete("/delete/:id", itemController.delete);

// For handling extra operations
router.get("/get_rows_total_weight", itemController.getRowsTotalWeight);
router.get("/get_average_weight/:row", itemController.getRowAverageWeight);
router.get("/get_all_empty_rows", itemController.getAllEmptyRows);
router.get("/row_stock_level/:row", itemController.getRowStockLevel);
router.get("/get_items_by_row_number/:row", itemController.getItemsByRowNum);
router.get("/get_items_by_name/:name", itemController.getItemsByName);
router.get("/find_expiring_items", itemController.findExpiringItems);
router.get("/get_items_by_tag/:tag", itemController.getItemsByTag);
router.get("/get_rows_running_out_of_stock", itemController.getRowsRunningOutOfStock);

module.exports = router;