const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authenticate");
const {
  exportBackup,
  importBackup,
} = require("../controllers/backupController");

router.get("/backup/export", authenticate, exportBackup);
router.post("/backup/import", authenticate, importBackup);

module.exports = router;
