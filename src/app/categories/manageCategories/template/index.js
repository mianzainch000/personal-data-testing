"use client";
import axios from "axios";
import Link from "next/link";
import Loader from "@/components/Loader";
import { useState, useEffect } from "react";
import { useSnackbar } from "@/components/Snackbar";
import ConfirmModal from "@/components/ConfirmModal";
import handleAxiosError from "@/components/HandleAxiosError";
import styles from "@/css/ManageCategories.module.css";

const emptyCategoryForm = { categoryName: "", categoryLink: "", detail: "" };
const emptySubForm = { subcategoryName: "", subcategoryLink: "", detail: "" };
const emptyItemForm = { title: "", subheading: "", detail: "", link: "" };

const CategoryClientWrapper = () => {
  const showAlertMessage = useSnackbar();

  const [loading, setLoading] = useState(false);

  // Step 1 - Categories
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryForm, setCategoryForm] = useState(emptyCategoryForm);
  const [editingCategory, setEditingCategory] = useState(false);

  // Step 2 - Subcategories
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [showSubForm, setShowSubForm] = useState(false);
  const [subForm, setSubForm] = useState(emptySubForm);
  const [editingSubcategory, setEditingSubcategory] = useState(false);

  // Step 3/4 - Detail cards (Items)
  const [items, setItems] = useState([]);
  const [showItemForm, setShowItemForm] = useState(false);
  const [itemForm, setItemForm] = useState(emptyItemForm);
  const [editingItemId, setEditingItemId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null); // { type, id, message }
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const selectedCategory = categories.find((c) => c._id === selectedCategoryId);
  const selectedSubcategory = subcategories.find(
    (s) => s._id === selectedSubcategoryId,
  );

  // ---------- Fetchers ----------
  const fetchCategories = async (keepSelection = true) => {
    try {
      const res = await axios.get("manageCategories/api");
      const list = res?.data?.data || [];
      setCategories(list);
      if (!keepSelection || !list.some((c) => c._id === selectedCategoryId)) {
        setSelectedCategoryId(list[0]?._id || "");
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    }
  };

  const fetchSubcategories = async (categoryId, keepSelection = true) => {
    if (!categoryId) {
      setSubcategories([]);
      setSelectedSubcategoryId("");
      return;
    }
    try {
      const res = await axios.get(
        `manageCategories/subcategories/api?categoryId=${categoryId}`,
      );
      const list = res?.data?.data || [];
      setSubcategories(list);
      if (
        !keepSelection ||
        !list.some((s) => s._id === selectedSubcategoryId)
      ) {
        setSelectedSubcategoryId("");
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    }
  };

  const fetchItems = async (categoryId, subcategoryId) => {
    if (!categoryId) {
      setItems([]);
      return;
    }
    try {
      const qs = subcategoryId ? `&subcategoryId=${subcategoryId}` : "";
      const res = await axios.get(
        `items/api?categoryId=${categoryId}${qs}`,
      );
      setItems(res?.data?.data || []);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSubcategories(selectedCategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]);

  useEffect(() => {
    fetchItems(selectedCategoryId, selectedSubcategoryId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId, selectedSubcategoryId]);

  // ---------- Step 1: Category actions ----------
  const openEditCategory = () => {
    if (!selectedCategory) return;
    setCategoryForm({
      categoryName: selectedCategory.categoryName || "",
      categoryLink: selectedCategory.categoryLink || "",
      detail: selectedCategory.detail || "",
    });
    setEditingCategory(true);
    setShowCategoryForm(true);
  };

  const openCreateCategory = () => {
    setCategoryForm(emptyCategoryForm);
    setEditingCategory(false);
    setShowCategoryForm(true);
  };

  const submitCategoryForm = async (e) => {
    e.preventDefault();
    if (!categoryForm.categoryName.trim()) return;
    setLoading(true);
    try {
      const res =
        editingCategory && selectedCategoryId
          ? await axios.put(
              `manageCategories/api/${selectedCategoryId}`,
              categoryForm,
            )
          : await axios.post("manageCategories/api", categoryForm);

      showAlertMessage({
        message:
          res?.data?.message ||
          (editingCategory ? "Category Updated" : "Category Added"),
        type: "success",
      });

      const newId = res?.data?.data?._id;
      setShowCategoryForm(false);
      setCategoryForm(emptyCategoryForm);
      setEditingCategory(false);
      await fetchCategories(false);
      if (!editingCategory && newId) setSelectedCategoryId(newId);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async () => {
    try {
      const res = await axios.delete(
        `manageCategories/api/${deleteTarget.id}`,
      );
      showAlertMessage({
        message: res?.data?.message || "Deleted successfully",
        type: "success",
      });
      setSelectedCategoryId("");
      await fetchCategories(false);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message: message || "Delete failed", type: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // ---------- Step 2: Subcategory actions ----------
  const openEditSubcategory = () => {
    if (!selectedSubcategory) return;
    setSubForm({
      subcategoryName: selectedSubcategory.subcategoryName || "",
      subcategoryLink: selectedSubcategory.subcategoryLink || "",
      detail: selectedSubcategory.detail || "",
    });
    setEditingSubcategory(true);
    setShowSubForm(true);
  };

  const openCreateSubcategory = () => {
    setSubForm(emptySubForm);
    setEditingSubcategory(false);
    setShowSubForm(true);
  };

  const submitSubForm = async (e) => {
    e.preventDefault();
    if (!subForm.subcategoryName.trim() || !selectedCategoryId) return;
    setLoading(true);
    try {
      const payload = { ...subForm, categoryId: selectedCategoryId };
      const res =
        editingSubcategory && selectedSubcategoryId
          ? await axios.put(
              `manageCategories/subcategories/api/${selectedSubcategoryId}`,
              payload,
            )
          : await axios.post("manageCategories/subcategories/api", payload);

      showAlertMessage({
        message:
          res?.data?.message ||
          (editingSubcategory ? "Subcategory Updated" : "Subcategory Added"),
        type: "success",
      });

      const newId = res?.data?.data?._id;
      setShowSubForm(false);
      setSubForm(emptySubForm);
      setEditingSubcategory(false);
      await fetchSubcategories(selectedCategoryId, false);
      if (!editingSubcategory && newId) setSelectedSubcategoryId(newId);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteSubcategory = async () => {
    try {
      const res = await axios.delete(
        `manageCategories/subcategories/api/${deleteTarget.id}`,
      );
      showAlertMessage({
        message: res?.data?.message || "Deleted successfully",
        type: "success",
      });
      setSelectedSubcategoryId("");
      await fetchSubcategories(selectedCategoryId, false);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message: message || "Delete failed", type: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  // ---------- Step 3/4: Detail card (Item) actions ----------
  const openCreateItem = () => {
    setItemForm(emptyItemForm);
    setEditingItemId(null);
    setShowItemForm(true);
  };

  const openEditItem = (item) => {
    setItemForm({
      title: item.title || "",
      subheading: item.subheading || "",
      detail: item.detail || "",
      link: item.link || "",
    });
    setEditingItemId(item._id);
    setShowItemForm(true);
  };

  const submitItemForm = async (e) => {
    e.preventDefault();
    if (!selectedCategoryId) return;

    const hasAnyValue =
      itemForm.title.trim() ||
      itemForm.subheading.trim() ||
      itemForm.detail.trim() ||
      itemForm.link.trim();

    if (!hasAnyValue) {
      showAlertMessage({
        message: "At least one field is required",
        type: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...itemForm,
        categoryId: selectedCategoryId,
        subcategoryId: selectedSubcategoryId || null,
      };
      const res = editingItemId
        ? await axios.put(`items/api/${editingItemId}`, payload)
        : await axios.post("items/api", payload);

      showAlertMessage({
        message:
          res?.data?.message ||
          (editingItemId ? "Card Updated" : "Card Added"),
        type: "success",
      });

      setShowItemForm(false);
      setItemForm(emptyItemForm);
      setEditingItemId(null);
      fetchItems(selectedCategoryId, selectedSubcategoryId);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async () => {
    try {
      const res = await axios.delete(`items/api/${deleteTarget.id}`);
      showAlertMessage({
        message: res?.data?.message || "Deleted successfully",
        type: "success",
      });
      fetchItems(selectedCategoryId, selectedSubcategoryId);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message: message || "Delete failed", type: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "category") return deleteCategory();
    if (deleteTarget.type === "subcategory") return deleteSubcategory();
    return deleteItem();
  };

  return (
    <div className={styles.pageWrap}>
      {loading && <Loader />}

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirm Delete"
        confirmText="Yes, Delete"
        message={deleteTarget?.message || "Are you sure you want to delete this?"}
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteTarget(null);
        }}
      />

      {/* Step 1: Category */}
      <div className={styles.stepCard}>
        <p className={styles.stepTitle}>
          <span className={styles.stepBadge}>1</span>
          Select a Category (Heading)
        </p>

        <select
          className={styles.select}
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">— Select —</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.categoryName}
            </option>
          ))}
        </select>

        {selectedCategory && (
          <div className={styles.groupButtons}>
            <button className={styles.editBtn} onClick={openEditCategory}>
              ✏️ Edit this category
            </button>
            <button
              className={styles.deleteBtn}
              onClick={() => {
                setDeleteTarget({
                  type: "category",
                  id: selectedCategoryId,
                  message:
                    "Are you sure you want to delete this category? Its subcategories and cards will be deleted too.",
                });
                setShowDeleteModal(true);
              }}
            >
              🗑️ Delete this category
            </button>
            <Link
              href={`/categories/view/${selectedCategoryId}`}
              className={styles.ghostBtn}
              style={{ textDecoration: "none" }}
            >
              👁️ View on page
            </Link>
          </div>
        )}

        <button
          type="button"
          className={styles.toggleCreate}
          onClick={() =>
            showCategoryForm ? setShowCategoryForm(false) : openCreateCategory()
          }
        >
          {showCategoryForm ? "▾" : "▸"} + Create a new category
        </button>

        {showCategoryForm && (
          <form className={styles.createPanel} onSubmit={submitCategoryForm}>
            <input
              type="text"
              placeholder="Category Name (e.g. Recipes, Books)"
              value={categoryForm.categoryName}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  categoryName: e.target.value,
                })
              }
              required
            />
            <input
              type="text"
              placeholder="Link (optional)"
              value={categoryForm.categoryLink}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  categoryLink: e.target.value,
                })
              }
            />
            <textarea
              placeholder="Detail (optional)"
              value={categoryForm.detail}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, detail: e.target.value })
              }
            />
            <div className={styles.createActions}>
              <button type="submit" className={styles.editBtn}>
                {editingCategory ? "Update" : "Create"}
              </button>
              <button
                type="button"
                className={styles.deleteBtn}
                onClick={() => setShowCategoryForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Step 2: Subcategory */}
      {selectedCategoryId && (
        <div className={styles.stepCard}>
          <p className={styles.stepTitle}>
            <span className={styles.stepBadge}>2</span>
            &quot;{selectedCategory?.categoryName}&quot; ke andar Sub Heading
            select karo
          </p>

          <select
            className={styles.select}
            value={selectedSubcategoryId}
            onChange={(e) => setSelectedSubcategoryId(e.target.value)}
          >
            <option value="">— Select — (Direct cards, no sub heading)</option>
            {subcategories.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subcategoryName}
              </option>
            ))}
          </select>

          {selectedSubcategory && (
            <div className={styles.groupButtons}>
              <button className={styles.editBtn} onClick={openEditSubcategory}>
                ✏️ Edit this sub heading
              </button>
              <button
                className={styles.deleteBtn}
                onClick={() => {
                  setDeleteTarget({
                    type: "subcategory",
                    id: selectedSubcategoryId,
                    message:
                      "Are you sure you want to delete this sub heading? Its cards will be deleted too.",
                  });
                  setShowDeleteModal(true);
                }}
              >
                🗑️ Delete this sub heading
              </button>
            </div>
          )}

          <button
            type="button"
            className={styles.toggleCreate}
            onClick={() =>
              showSubForm ? setShowSubForm(false) : openCreateSubcategory()
            }
          >
            {showSubForm ? "▾" : "▸"} + &quot;{selectedCategory?.categoryName}
            &quot; ke andar nai sub heading banao
          </button>

          {showSubForm && (
            <form className={styles.createPanel} onSubmit={submitSubForm}>
              <input
                type="text"
                placeholder="Sub Heading Name (e.g. Namaz, Wudu)"
                value={subForm.subcategoryName}
                onChange={(e) =>
                  setSubForm({ ...subForm, subcategoryName: e.target.value })
                }
                required
              />
              <input
                type="text"
                placeholder="Link (optional)"
                value={subForm.subcategoryLink}
                onChange={(e) =>
                  setSubForm({ ...subForm, subcategoryLink: e.target.value })
                }
              />
              <textarea
                placeholder="Detail (optional)"
                value={subForm.detail}
                onChange={(e) =>
                  setSubForm({ ...subForm, detail: e.target.value })
                }
              />
              <div className={styles.createActions}>
                <button type="submit" className={styles.editBtn}>
                  {editingSubcategory ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => setShowSubForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 3: Add detail card */}
      {selectedCategoryId && (
        <div className={styles.stepCard}>
          <p className={styles.stepTitle}>
            <span className={styles.stepBadge}>3</span>
            &quot;
            {selectedSubcategory?.subcategoryName ||
              selectedCategory?.categoryName}
            &quot; mein naya detail card add karo
          </p>

          <button
            type="button"
            className={styles.toggleCreate}
            onClick={() =>
              showItemForm ? setShowItemForm(false) : openCreateItem()
            }
          >
            {showItemForm ? "▾" : "▸"} + Add Detail Card
          </button>

          {showItemForm && (
            <form className={styles.createPanel} onSubmit={submitItemForm}>
              <input
                type="text"
                placeholder="Heading (optional)"
                value={itemForm.title}
                onChange={(e) =>
                  setItemForm({ ...itemForm, title: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Sub Heading (optional)"
                value={itemForm.subheading}
                onChange={(e) =>
                  setItemForm({ ...itemForm, subheading: e.target.value })
                }
              />
              <textarea
                placeholder="Detail (optional)"
                value={itemForm.detail}
                onChange={(e) =>
                  setItemForm({ ...itemForm, detail: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Link (optional)"
                value={itemForm.link}
                onChange={(e) =>
                  setItemForm({ ...itemForm, link: e.target.value })
                }
              />
              <div className={styles.createActions}>
                <button type="submit" className={styles.editBtn}>
                  {editingItemId ? "Update" : "Create"}
                </button>
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => {
                    setShowItemForm(false);
                    setEditingItemId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Step 4: List of detail cards */}
      {selectedCategoryId && (
        <div className={styles.stepCard}>
          <p className={styles.stepTitle}>
            <span className={styles.stepBadge}>4</span>
            &quot;
            {selectedSubcategory?.subcategoryName ||
              selectedCategory?.categoryName}
            &quot; ke detail cards ({items.length})
          </p>

          {items.length === 0 && (
            <p className={styles.disabledHint}>Koi card nahi bana abhi.</p>
          )}

          <div className={styles.detailList}>
            {items.map((item, index) => (
              <div key={item._id} className={styles.detailRow}>
                <span className={styles.detailNumber}>{index + 1}</span>
                <div className={styles.detailBody}>
                  {item.title && (
                    <p className={styles.detailTitle}>{item.title}</p>
                  )}
                  {item.subheading && (
                    <p className={styles.detailSubheading}>
                      {item.subheading}
                    </p>
                  )}
                  {item.detail && (
                    <p className={styles.detailText}>{item.detail}</p>
                  )}
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.cardLink}
                    >
                      {item.link}
                    </a>
                  )}
                </div>
                <div className={styles.detailActions}>
                  <span onClick={() => openEditItem(item)} title="Edit">
                    ✏️
                  </span>
                  <span
                    onClick={() => {
                      setDeleteTarget({
                        type: "item",
                        id: item._id,
                        message: "Are you sure you want to delete this card?",
                      });
                      setShowDeleteModal(true);
                    }}
                    title="Delete"
                  >
                    🗑️
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryClientWrapper;
