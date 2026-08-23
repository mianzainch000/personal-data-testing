"use client";
import axios from "axios";
import Link from "next/link";
import Form from "@/components/Form";
import Loader from "@/components/Loader";
import ItemCard from "@/components/ItemCard";
import itemStyles from "@/css/ItemCard.module.css";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/components/Snackbar";
import ConfirmModal from "@/components/ConfirmModal";
import handleAxiosError from "@/components/HandleAxiosError";

const CategoryExplorer = ({ categoryId, subcategoryId = null }) => {
  const showAlertMessage = useSnackbar();

  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [catsRes, itemsRes] = await Promise.all([
        axios.get("/categories/manageCategories/api"),
        axios.get(
          `/categories/items/api?categoryId=${categoryId}${
            subcategoryId ? `&subcategoryId=${subcategoryId}` : ""
          }`,
        ),
      ]);

      const cats = catsRes?.data?.data || [];
      const currentCategory = cats.find((c) => c._id === categoryId) || null;
      setCategory(currentCategory);

      if (!subcategoryId) {
        const subRes = await axios.get(
          `/categories/manageCategories/subcategories/api?categoryId=${categoryId}`,
        );
        setSubcategories(subRes?.data?.data || []);
        setSubcategory(null);
      } else {
        const subRes = await axios.get(
          `/categories/manageCategories/subcategories/api?categoryId=${categoryId}`,
        );
        const subs = subRes?.data?.data || [];
        setSubcategory(subs.find((s) => s._id === subcategoryId) || null);
        setSubcategories([]);
      }

      setItems(itemsRes?.data?.data || []);
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, subcategoryId]);

  const handleFormSubmit = async (formData) => {
    try {
      const payload = { ...formData, categoryId, subcategoryId };
      const res = editData
        ? await axios.put(`/categories/items/api/${editData._id}`, payload)
        : await axios.post("/categories/items/api", payload);

      const successMsg =
        res?.data?.message || (editData ? "Card Updated" : "Card Added");
      showAlertMessage({ message: successMsg, type: "success" });
      setEditData(null);
      fetchAll();
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message, type: "error" });
    }
  };

  const handleDelete = async () => {
    try {
      const res = await axios.delete(`/categories/items/api/${deleteId}`);
      const successMsg = res?.data?.message || "Deleted successfully";
      showAlertMessage({ message: successMsg, type: "success" });
      fetchAll();
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlertMessage({ message: message || "Delete failed", type: "error" });
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
    }
  };

  if (loading) return <Loader />;

  const heading = subcategoryId
    ? subcategory?.subcategoryName || "..."
    : category?.categoryName || "...";

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1000, margin: "0 auto" }}>
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirm Delete"
        confirmText="Yes, Delete"
        message="Are you sure you want to delete this card?"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
      />

      <div style={{ marginBottom: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
        <Link href="/categories" style={{ textDecoration: "none" }}>
          ⬅ All Categories
        </Link>
        {subcategoryId && (
          <>
            {"  /  "}
            <Link
              href={`/categories/view/${categoryId}`}
              style={{ textDecoration: "none" }}
            >
              {category?.categoryName || "Category"}
            </Link>
          </>
        )}
      </div>

      <h2 className="h2">{heading}</h2>

      {!subcategoryId && subcategories.length > 0 && (
        <>
          <h3 style={{ margin: "1rem 0 0.5rem" }}>Subheadings</h3>
          <div className="categorie-grid">
            {subcategories.map((sub) => (
              <Link
                key={sub._id}
                href={`/categories/view/${categoryId}/${sub._id}`}
                className="categorie-card"
              >
                {sub.subcategoryName}
              </Link>
            ))}
          </div>
        </>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <Form
          title="Add Card"
          initialData={editData}
          onCancelEdit={() => setEditData(null)}
          fields={[
            {
              key: "title",
              label: "Heading",
              placeholder: "e.g. Card title",
              required: true,
            },
            {
              key: "subheading",
              label: "Sub Heading (optional)",
              placeholder: "e.g. short label",
              required: false,
            },
            {
              key: "detail",
              label: "Detail (optional)",
              type: "textarea",
              placeholder: "Write full detail here...",
              required: false,
            },
            {
              key: "link",
              label: "Link (optional)",
              placeholder: "https://...",
              required: false,
            },
          ]}
          onSubmit={handleFormSubmit}
        />
      </div>

      {items.length === 0 ? (
        <p className={itemStyles.emptyText}>No cards here yet. Add your first one above.</p>
      ) : (
        <div className={itemStyles.grid}>
          {items.map((item) => (
            <ItemCard
              key={item._id}
              item={item}
              onEdit={(row) => setEditData(row)}
              onDelete={(id) => {
                setDeleteId(id);
                setShowDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryExplorer;
