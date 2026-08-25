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

    // When true, this category is hidden everywhere (dropdown + main page)
    // unless the user logged in with the correct special code (req.user.hasAccess).
    protected: { type: Boolean, default: false },
    // If set, category auto re-hides this many minutes after login/unlock,
    // even if hasAccess is still true — special code must be re-entered to see it again.
    protectTimeoutMinutes: { type: Number, default: null },

    order: { type: Number, default: 0 },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.Category || mongoose.model("Category", categorySchema);
