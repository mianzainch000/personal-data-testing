const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.post("/createCategory", authenticate, createCategory);
router.get("/getCategories", authenticate, getCategories);
router.put("/updateCategory/:id", authenticate, updateCategory);
router.delete("/deleteCategory/:id", authenticate, deleteCategory);

module.exports = router;
