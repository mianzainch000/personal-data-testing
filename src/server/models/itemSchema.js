const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subcategoryId: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      default: null,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },
    subheading: {
      type: String,
      trim: true,
      default: "",
    },
    detail: {
      type: String,
      trim: true,
      default: "",
    },
    link: {
      type: String,
      trim: true,
      default: "",
    },

    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);
