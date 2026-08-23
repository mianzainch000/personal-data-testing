import Link from "next/link";
import { cookies } from "next/headers";
import Header from "@/components/Header";
import styles from "@/css/404.module.css";

const Custom404 = async () => {
  const cookieStore = await cookies();
  const theme = cookieStore.get("theme")?.value || "light";
  const name = cookieStore.get("name")?.value || null;
  return (
    <>
      <Header initialTheme={theme} initialName={name} />
      <main className={styles.container}>
        <div className={styles.card} role="main" aria-labelledby="title">
          <div className={styles.illustration} aria-hidden="true">
            {}
            <svg
              viewBox="0 0 600 400"
              xmlns="http://www.w3.org/2000/svg"
              className={styles.svg}
            >
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0%" stopColor="#6EE7B7" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
              <rect
                x="40"
                y="60"
                width="520"
                height="260"
                rx="20"
                fill="url(#g1)"
                opacity="0.12"
              />
              <g transform="translate(120,90)">
                <circle cx="120" cy="80" r="64" fill="#fff" opacity="0.9" />
                <path
                  d="M60 160c20-40 160-40 180 0"
                  stroke="#fff"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.9"
                />
                <text
                  x="100"
                  y="95"
                  textAnchor="middle"
                  fontSize="36"
                  fontWeight="700"
                  fill="#111"
                >
                  :-(
                </text>
              </g>
            </svg>
          </div>

          <header className={styles.header}>
            <h1 id="title" className={styles.title}>
              404 — Page not found
            </h1>
            <p className={styles.subtitle}>
              Looks like you took a wrong turn. But don’t worry — we’ll get you
              back on track.
            </p>
          </header>

          <nav className={styles.actions} aria-label="Primary">
            <Link
              href="/"
              className={styles.primaryBtn}
              aria-label="Go to homepage"
            >
              Go to Homepage
            </Link>
          </nav>

          <footer className={styles.footnote}>
            <small>
              Tip: try checking the URL or returning to the homepage.
            </small>
          </footer>
        </div>
      </main>
    </>
  );
};

export default Custom404;

export function generateMetadata() {
  return { title: "404" };
}
