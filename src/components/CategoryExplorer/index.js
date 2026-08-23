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

  const [subcategories, setSubcategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [subRes, itemsRes] = await Promise.all([
        axios.get(
          `/categories/manageCategories/subcategories/api?categoryId=${categoryId}`,
        ),
        axios.get(
          `/categories/items/api?categoryId=${categoryId}${
            subcategoryId ? `&subcategoryId=${subcategoryId}` : ""
          }`,
        ),
      ]);

      const subs = subRes?.data?.data || [];
      setSubcategories(subcategoryId ? [] : subs);
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

  return (
    <div className={itemStyles.pageContainer}>
      {!subcategoryId && subcategories.length > 0 && (
        <>
          <h3 className={itemStyles.sectionLabel}>Subheadings</h3>
          <div className="categorie-grid">
            {subcategories.map((sub) => (
              <Link
                key={sub._id}
                href={`/categories/${categoryId}/${sub._id}`}
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
