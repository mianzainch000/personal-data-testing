const mongoose = require("mongoose");
const { Schema } = mongoose;
const categorySchema = new mongoose.Schema(
  {
    categoryName: {
      type: String,
      trim: true,
    },
    categoryLink: {
      type: String,
      trim: true,
    },
    detail: {
      type: String,
      trim: true,
      default: "",
    },

    protected: { type: Boolean, default: false },

    protectTimeoutMinutes: { type: Number, default: null },

    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
