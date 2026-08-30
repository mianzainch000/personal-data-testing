const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  uploadFile,
  getFile,
  deleteFile,
} = require("../controllers/fileController");

router.post("/files/upload", authenticate, uploadFile);
router.get("/files/:id", authenticate, getFile);
router.delete("/files/:id", authenticate, deleteFile);

module.exports = router;
