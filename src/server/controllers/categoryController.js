const Category = require("../models/categorySchema");
const Subcategory = require("../models/subcategorySchema");
const Item = require("../models/itemSchema");
const UploadedFile = require("../models/uploadedFileSchema");
const { extractFileIdsFromMany } = require("../helper/itemFiles");
const { isCategoryAccessible } = require("../helper/categoryAccess");

exports.getCategories = async (req, res) => {
  try {
    const all = await Category.find({ userId: req.user._id }).sort({
      order: 1,
      createdAt: 1,
    });

    const categories = all.filter((c) => isCategoryAccessible(c, req.user));

    res.status(200).json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const {
      categoryName,
      categoryLink,
      detail,
      position,
      protected: isProtected,
      protectTimeoutMinutes,
    } = req.body;

    if (!categoryName || !String(categoryName).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const count = await Category.countDocuments({ userId: req.user._id });
    let insertOrder = count;

    if (position !== undefined && position !== null && position !== "") {
      const pos = Math.max(1, Math.min(Number(position), count + 1));
      insertOrder = pos - 1;

      await Category.updateMany(
        { userId: req.user._id, order: { $gte: insertOrder } },
        { $inc: { order: 1 } },
      );
    }

    const newCategory = await Category.create({
      categoryName,
      categoryLink: categoryLink || "",
      detail: detail || "",
      protected: Boolean(isProtected),
      protectTimeoutMinutes:
        isProtected && protectTimeoutMinutes
          ? Number(protectTimeoutMinutes)
          : null,
      userId: req.user._id,
      order: insertOrder,
    });

    res.status(201).json({
      success: true,
      data: newCategory,
      message: "Category Created successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const {
      position,
      categoryName,
      categoryLink,
      detail,
      protected: isProtected,
      protectTimeoutMinutes,
    } = req.body;

    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!category)
      return res.status(404).json({ success: false, message: "Not found" });

    if (position !== undefined && position !== null && position !== "") {
      const siblings = await Category.find({
        userId: req.user._id,
        _id: { $ne: category._id },
      }).sort({ order: 1 });

      const pos = Math.max(1, Math.min(Number(position), siblings.length + 1));
      siblings.splice(pos - 1, 0, category);

      await Promise.all(
        siblings.map((doc, index) => {
          if (String(doc._id) === String(category._id)) {
            category.order = index;
            return null;
          }
          return Category.updateOne({ _id: doc._id }, { order: index });
        }),
      );
    }

    if (categoryName !== undefined) category.categoryName = categoryName;
    if (categoryLink !== undefined) category.categoryLink = categoryLink;
    if (detail !== undefined) category.detail = detail;
    if (isProtected !== undefined) category.protected = Boolean(isProtected);
    if (protectTimeoutMinutes !== undefined) {
      category.protectTimeoutMinutes =
        category.protected && protectTimeoutMinutes
          ? Number(protectTimeoutMinutes)
          : null;
    }

    await category.save();

    res.status(200).json({
      success: true,
      data: category,
      message: "Category Updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    // Deleting a category used to leave its Items behind as orphaned
    // documents (still tagged with the now-deleted categoryId) — they'd
    // never show up in the UI again but would sit in the database
    // forever, including any encrypted personal-data field values and
    // any uploaded files they referenced.
    const itemsToDelete = await Item.find({
      categoryId: deleted._id,
      userId: req.user._id,
    });
    const fileIds = extractFileIdsFromMany(itemsToDelete);
    if (fileIds.length) {
      await UploadedFile.deleteMany({
        _id: { $in: fileIds },
        userId: req.user._id,
      });
    }

    await Item.deleteMany({
      categoryId: deleted._id,
      userId: req.user._id,
    });

    await Subcategory.deleteMany({
      categoryId: deleted._id,
      userId: req.user._id,
    });

    await Category.updateMany(
      { userId: req.user._id, order: { $gt: deleted.order } },
      { $inc: { order: -1 } },
    );

    res
      .status(200)
      .json({ success: true, message: "Category Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
