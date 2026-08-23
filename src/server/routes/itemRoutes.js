const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  reorderItems,
} = require("../controllers/itemController");

router.get("/getItems", authenticate, getItems);
router.post("/createItem", authenticate, createItem);
router.put("/reorderItems", authenticate, reorderItems);
router.put("/updateItem/:id", authenticate, updateItem);
router.delete("/deleteItem/:id", authenticate, deleteItem);

module.exports = router;
