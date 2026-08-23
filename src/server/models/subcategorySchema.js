const mongoose = require("mongoose");
const { Schema } = mongoose;
const subcategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    subcategoryName: {
      type: String,
      required: true,
      trim: true,
    },
    subcategoryLink: {
      type: String,
      trim: true,
    },
    detail: {
      type: String,
      trim: true,
      default: "",
    },

    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Subcategory ||
  mongoose.model("Subcategory", subcategorySchema);
