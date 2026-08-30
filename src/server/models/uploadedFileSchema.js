const mongoose = require("mongoose");
const { Schema } = mongoose;

const uploadedFileSchema = new Schema(
  {
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, default: "application/octet-stream" },
    data: { type: Buffer, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.UploadedFile ||
  mongoose.model("UploadedFile", uploadedFileSchema);
