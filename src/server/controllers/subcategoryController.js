const Subcategory = require("../models/subcategorySchema");
const Category = require("../models/categorySchema");
const Item = require("../models/itemSchema");
const UploadedFile = require("../models/uploadedFileSchema");
const { extractFileIdsFromMany } = require("../helper/itemFiles");

exports.getSubcategories = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = { userId: req.user._id };
    if (categoryId) filter.categoryId = categoryId;

    const subcategories = await Subcategory.find(filter).sort({
      order: 1,
      createdAt: 1,
    });
    res.status(200).json({ success: true, data: subcategories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSubcategory = async (req, res) => {
  try {
    const { categoryId, subcategoryName, subcategoryLink, detail, position } =
      req.body;

    if (!categoryId || !subcategoryName || !String(subcategoryName).trim()) {
      return res.status(400).json({
        success: false,
        message: "categoryId and subcategoryName are required",
      });
    }

    // Without this check, anyone with a valid login could attach a
    // subcategory to ANY categoryId (including another user's), simply
    // by guessing/knowing the id — the subcategory itself was already
    // being tagged with the caller's own userId, but nothing verified
    // the parent category actually belonged to them first.
    const parentCategory = await Category.findOne({
      _id: categoryId,
      userId: req.user._id,
    });
    if (!parentCategory) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }

    const count = await Subcategory.countDocuments({
      categoryId,
      userId: req.user._id,
    });
    let insertOrder = count;

    if (position !== undefined && position !== null && position !== "") {
      const pos = Math.max(1, Math.min(Number(position), count + 1));
      insertOrder = pos - 1;

      await Subcategory.updateMany(
        {
          categoryId,
          userId: req.user._id,
          order: { $gte: insertOrder },
        },
        { $inc: { order: 1 } },
      );
    }

    const newSubcategory = await Subcategory.create({
      categoryId,
      subcategoryName,
      subcategoryLink: subcategoryLink || "",
      detail: detail || "",
      order: insertOrder,
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: newSubcategory,
      message: "Subcategory Created successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const { position, subcategoryName, subcategoryLink, detail } = req.body;

    const subcategory = await Subcategory.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!subcategory)
      return res.status(404).json({ success: false, message: "Not found" });

    if (position !== undefined && position !== null && position !== "") {
      const siblings = await Subcategory.find({
        categoryId: subcategory.categoryId,
        userId: req.user._id,
        _id: { $ne: subcategory._id },
      }).sort({ order: 1 });

      const pos = Math.max(1, Math.min(Number(position), siblings.length + 1));
      siblings.splice(pos - 1, 0, subcategory);

      await Promise.all(
        siblings.map((doc, index) => {
          if (String(doc._id) === String(subcategory._id)) {
            subcategory.order = index;
            return null;
          }
          return Subcategory.updateOne({ _id: doc._id }, { order: index });
        }),
      );
    }

    if (subcategoryName !== undefined)
      subcategory.subcategoryName = subcategoryName;
    if (subcategoryLink !== undefined)
      subcategory.subcategoryLink = subcategoryLink;
    if (detail !== undefined) subcategory.detail = detail;

    await subcategory.save();

    res.status(200).json({
      success: true,
      data: subcategory,
      message: "Subcategory Updated successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSubcategory = async (req, res) => {
  try {
    const deleted = await Subcategory.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    // Same orphaned-data issue as category deletion — items under this
    // subcategory (and any files they reference) were never cleaned up.
    const itemsToDelete = await Item.find({
      subcategoryId: deleted._id,
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
      subcategoryId: deleted._id,
      userId: req.user._id,
    });

    await Subcategory.updateMany(
      {
        categoryId: deleted.categoryId,
        userId: req.user._id,
        order: { $gt: deleted.order },
      },
      { $inc: { order: -1 } },
    );

    res
      .status(200)
      .json({ success: true, message: "Subcategory Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
