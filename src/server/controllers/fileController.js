const UploadedFile = require("../models/uploadedFileSchema");

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB raw (~4MB after base64) — stays under Vercel's ~4.5MB request limit

exports.uploadFile = async (req, res) => {
  try {
    const { fileName, mimeType, dataBase64 } = req.body;
    if (!fileName || !dataBase64) {
      return res.status(400).json({
        success: false,
        message: "fileName and dataBase64 are required",
      });
    }

    const buffer = Buffer.from(dataBase64, "base64");
    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "File is too large (max 5MB)",
      });
    }

    const file = await UploadedFile.create({
      fileName,
      mimeType: mimeType || "application/octet-stream",
      data: buffer,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      fileId: file._id,
      fileName: file.fileName,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getFile = async (req, res) => {
  try {
    const file = await UploadedFile.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!file) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.status(200).json({
      success: true,
      fileName: file.fileName,
      mimeType: file.mimeType,
      dataBase64: file.data.toString("base64"),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    await UploadedFile.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
