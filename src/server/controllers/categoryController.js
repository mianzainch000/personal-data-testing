const Category = require("../models/categorySchema");
const Subcategory = require("../models/subcategorySchema");

exports.getCategories = async (req, res) => {
  try {
    const all = await Category.find({ userId: req.user._id }).sort({
      order: 1,
      createdAt: 1,
    });

    const hasAccess = req.user?.hasAccess === true;
    // Minutes elapsed since this session's special code was verified (JWT iat).
    const minutesSinceUnlock = req.user?.iat
      ? (Date.now() / 1000 - req.user.iat) / 60
      : Infinity;

    let hasHiddenProtected = false;
    const categories = all.filter((c) => {
      if (!c.protected) return true;
      if (!hasAccess) {
        hasHiddenProtected = true;
        return false;
      }
      if (
        c.protectTimeoutMinutes &&
        minutesSinceUnlock >= c.protectTimeoutMinutes
      ) {
        hasHiddenProtected = true;
        return false;
      }
      return true;
    });

    res
      .status(200)
      .json({ success: true, data: categories, meta: { hasHiddenProtected } });
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
