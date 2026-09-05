const mongoose = require("mongoose");
const { Schema } = mongoose;

const itemFieldSchema = new Schema({
  label: { type: String, trim: true, required: true },
  type: {
    type: String,
    enum: ["text", "number", "date", "email", "encrypt", "file"],
    default: "text",
  },
  placeholder: { type: String, trim: true, default: "" },
});

const itemRowSchema = new Schema({
  order: { type: Number, default: 0 },
  values: { type: Schema.Types.Mixed, default: {} },
});

const itemTabSchema = new Schema({
  tabName: { type: String, trim: true, default: "" },
  detail: { type: String, trim: true, default: "" },
  linkTitle: { type: String, trim: true, default: "" },
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

      newRowPosition: { type: String, enum: ["top", "bottom"], default: "top" },

      paginationRowsPerPage: { type: Schema.Types.Mixed, default: "all" },
      paginationCustomOptions: { type: [Number], default: [] },

      addTabButtonLabel: { type: String, trim: true, default: "" },

      messages: {
        rowAdded: { type: String, trim: true, default: "" },
        rowUpdated: { type: String, trim: true, default: "" },
        rowDeleted: { type: String, trim: true, default: "" },
      },
    },
    fields: { type: [itemFieldSchema], default: [] },
    tabs: { type: [itemTabSchema], default: [] },

    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.models.Item || mongoose.model("Item", itemSchema);
