"use client";
import axios from "axios";
import Link from "next/link";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import { useEffect, useState } from "react";
import UnlockProtected from "@/components/UnlockProtected";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/categories/manageCategories/api");
        setCategories(res?.data?.data || []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="categorie-container">
      <h2 className="categorie-heading">
        My Categories <UnlockProtected />
      </h2>

      <Link
        href="categories/manageCategories"
        style={{ textDecoration: "none" }}
      >
        <Button variant="primary">🗂️ Manage Categories</Button>
      </Link>
      <br />
      <br />

      {loading && <Loader />}

      {!loading && categories.length === 0 && (
        <p style={{ textAlign: "center", opacity: 0.8 }}>
          No categories yet. Add your first category (Heading) from &quot;Manage
          Categories&quot;.
        </p>
      )}

      <div className="categorie-grid">
        {categories.map((item) => (
          <Link
            key={item._id}
            href={`categories/${item._id}`}
            className="categorie-card"
          >
            {item.categoryName}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Categories;
