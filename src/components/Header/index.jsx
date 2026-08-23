"use client";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/css/Header.module.css";
import { useSnackbar } from "@/components/Snackbar";
import ConfirmModal from "@/components/ConfirmModal";
import { deleteCookie, setCookie } from "cookies-next";

const Header = ({ initialTheme, initialName }) => {
  const router = useRouter();
  const showAlert = useSnackbar();
  const [theme, setTheme] = useState(initialTheme);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    setCookie("theme", newTheme, { maxAge: 60 * 60 * 24 * 365 });
  };

  const handleLogout = async () => {
    setShowModal(false);

    try {
      await fetch("/api/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    }

    deleteCookie("activeTab", { path: "/" });
    deleteCookie("yearFilter", { path: "/" });
    deleteCookie("monthFilter", { path: "/" });
    deleteCookie("currentPage", { path: "/" });
    deleteCookie("rowsPerPage", { path: "/" });

    showAlert({
      message: "✅ Logout successful",
      type: "success",
    });
    router.replace("/");
    router.refresh();
  };

  return (
    <>
      <div className={styles.headerBar}>
        {}
        <div className={styles.logo}>
          <Link href={"/"}>
            <Image src="/logo.png" alt="Logo" width={50} height={50} />
          </Link>
        </div>
        {}
        <div className={styles.welcomeText}>
          Welcome {initialName || "Guest"}
        </div>
        {}
        <div className={styles.rightActions}>
          <Button
            onClick={toggleTheme}
            variant="primary"
            className={styles.themeToggle}
          >
            {theme === "light" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </Button>

          <Button
            onClick={() => setShowModal(true)}
            className={styles.logoutBtn}
            variant="danger"
          >
            Logout
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showModal}
        title="Confirm Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={handleLogout}
        onCancel={() => setShowModal(false)}
      />
    </>
  );
};

export default Header;
