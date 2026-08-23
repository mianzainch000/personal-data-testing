"use client";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Loader from "@/components/Loader";
import styles from "@/css/Auth.module.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";

const LoginForm = () => {
  const router = useRouter();
  const showAlert = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSpecialCode, setShowSpecialCode] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    specialCode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await Login();
  };

  const Login = async () => {
    try {
      setLoading(true);
      const res = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        specialCode: formData.specialCode,
        redirect: false,
      });

      if (res?.ok) {
        showAlert({ message: "✅ Login successful", type: "success" });

        setFormData({ email: "", password: "", specialCode: "" });
        router.push("/categories");
      } else {
        showAlert({ message: `❌ ${res?.error}`, type: "error" });
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlert({ message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className={styles.authContainer}>
        <div className={styles.card}>
          <div className={styles.header}>
            <h2 className={styles.title}>Welcome back</h2>
            <p className={styles.subtitle}>
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            {}
            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
              />
            </div>

            {}
            <div className={styles.formGroup}>
              <label className={styles.label}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={showPassword ? "1234..." : "••••••••"}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {}
            <div className={styles.formGroup}>
              <label className={styles.label}>Special Code</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type={showSpecialCode ? "text" : "password"}
                  name="specialCode"
                  value={formData.specialCode}
                  onChange={handleChange}
                  placeholder={showSpecialCode ? "0000" : "••••"}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowSpecialCode(!showSpecialCode)}
                >
                  {showSpecialCode ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={!formData.email || !formData.password}
            >
              Sign in
            </button>
          </form>

          <div className={styles.footer}>
            <Link href="/forgotPassword">Forgot your password?</Link>
            <div style={{ marginTop: "8px" }}>
              <span>Don&apos;t have an account? </span>
              <Link href="/signup">Create Account</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginForm;
