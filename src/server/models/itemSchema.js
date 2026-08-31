const mongoose = require("mongoose");
const { Schema } = mongoose;

// One column/field of a dynamic table. Fully user-defined (any label/name).
const itemFieldSchema = new Schema({
  label: { type: String, trim: true, required: true },
  type: {
    type: String,
    enum: ["text", "number", "date", "email", "encrypt", "file"],
    default: "text",
  },
});

// One data row inside a tab. `values` is keyed by the field's _id (string).
const itemRowSchema = new Schema({
  order: { type: Number, default: 0 },
  values: { type: Schema.Types.Mixed, default: {} },
});

// One tab (e.g. "Meter 1", "Meter 2") inside a detail card, each holding its own rows.
const itemTabSchema = new Schema({
  tabName: { type: String, trim: true, default: "" },
  detail: { type: String, trim: true, default: "" },
  link: { type: String, trim: true, default: "" },
  order: { type: Number, default: 0 },
  rows: { type: [itemRowSchema], default: [] },
});

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
      trim: true,
      default: "",
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

    // ---- Dynamic detail-card widgets ----
    // config.table is the master switch; the rest only matter when it's on.
    config: {
      table: { type: Boolean, default: false },
      tabs: { type: Boolean, default: false },
      dragDrop: { type: Boolean, default: false },
      pagination: { type: Boolean, default: false },
      search: { type: Boolean, default: false },
      filter: { type: Boolean, default: false },
      pdf: { type: Boolean, default: false },
      json: { type: Boolean, default: false },
      exportJson: { type: Boolean, default: false },
      // Where a newly added row goes: "top" (latest-first, default) or "bottom".
      newRowPosition: { type: String, enum: ["top", "bottom"], default: "top" },
    },
    fields: { type: [itemFieldSchema], default: [] },
    tabs: { type: [itemTabSchema], default: [] },

    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);
