"use client";
import axios from "axios";
import Link from "next/link";
import Loader from "@/components/Loader";
import ItemCard from "@/components/ItemCard";
import itemStyles from "@/css/ItemCard.module.css";
import { useEffect, useState } from "react";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";

const CategoryExplorer = ({ categoryId, subcategoryId = null }) => {
  const showAlertMessage = useSnackbar();

  const [category, setCategory] = useState(null);
  const [subcategory, setSubcategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

      const subRes = await axios.get(
        `/categories/manageCategories/subcategories/api?categoryId=${categoryId}`,
      );
      const subs = subRes?.data?.data || [];

      if (!subcategoryId) {
        setSubcategories(subs);
        setSubcategory(null);
      } else {
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

  if (loading) return <Loader />;

  const heading = subcategoryId
    ? subcategory?.subcategoryName || "..."
    : category?.categoryName || "...";

  return (
    <div className={itemStyles.pageContainer}>
      <div className={itemStyles.breadcrumb}>
        <Link href="/categories">⬅ All Categories</Link>
        {subcategoryId ? (
          <>
            <span className={itemStyles.breadcrumbSep}>/</span>
            <Link href={`/categories/view/${categoryId}`}>
              {category?.categoryName || "Category"}
            </Link>
            <span className={itemStyles.breadcrumbSep}>/</span>
            <span className={itemStyles.breadcrumbCurrent}>{heading}</span>
          </>
        ) : (
          <>
            <span className={itemStyles.breadcrumbSep}>/</span>
            <span className={itemStyles.breadcrumbCurrent}>{heading}</span>
          </>
        )}
      </div>

      <h1 className={itemStyles.pageTitle}>{heading}</h1>

      {!subcategoryId && subcategories.length > 0 && (
        <>
          <h3 className={itemStyles.sectionLabel}>Subheadings</h3>
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

      {(subcategoryId || subcategories.length === 0) &&
        (items.length === 0 ? (
          <p className={itemStyles.emptyText}>
            Koi card nahi hai. Manage Categories se add karein.
          </p>
        ) : (
          <div className={itemStyles.list}>
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ))}
    </div>
  );
};

export default CategoryExplorer;
