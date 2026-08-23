const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  getSubcategories,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = require("../controllers/subcategoryController");

router.get("/getSubcategories", authenticate, getSubcategories);
router.post("/createSubcategory", authenticate, createSubcategory);
router.put("/updateSubcategory/:id", authenticate, updateSubcategory);
router.delete("/deleteSubcategory/:id", authenticate, deleteSubcategory);

module.exports = router;
