import { cookies } from "next/headers";
import Header from "@/components/Header";
import styles from "@/css/Header.module.css";

const Layout = async ({ children }) => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";
  const name = cookieStore.get("name")?.value || null;

  return (
    <div className={styles.headerContainer}>
      <Header initialTheme={theme} initialName={name} />

      {children}
    </div>
  );
};

export default Layout;
