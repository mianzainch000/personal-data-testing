const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    hashedCode: { type: String },
    rowsPerPage: { type: String, default: "all" },
    customRowOptions: { type: [Number], default: [] },
  },
  { timestamps: true },
);
module.exports = mongoose.models.user || mongoose.model("user", userSchema);
