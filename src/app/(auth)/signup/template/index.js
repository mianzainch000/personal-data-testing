"use client";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import Loader from "@/components/Loader";
import styles from "@/css/Auth.module.css";
import { useRouter } from "next/navigation";
import { apiConfig } from "@/config/apiConfig";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";

const SignupForm = () => {
  const router = useRouter();
  const showAlert = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    code: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await SignupApi();
  };

  const SignupApi = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${apiConfig.baseUrl}${apiConfig.signup}`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        code: formData.code,
      });

      if (res?.status === 201) {
        showAlert({
          message: "✅ Account created! You can now log in.",
          type: "success",
        });

        setFormData({
          name: "",
          email: "",
          password: "",
          code: "",
        });

        router.push("/");
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
            <h2 className={styles.title}>Create your account</h2>
            <p className={styles.subtitle}>
              Sign up and start saving your own data securely.
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Zain Ishfaq"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input
                className={styles.input}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@company.com"
                required
              />
            </div>

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
                  required
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

            <div className={styles.formGroup}>
              <label className={styles.label}>Special Code</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type={showCode ? "text" : "password"}
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder={showCode ? "0000" : "••••"}
                  required
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowCode(!showCode)}
                >
                  {showCode ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={
                !formData.name ||
                !formData.email ||
                !formData.password ||
                !formData.code
              }
            >
              Create Account
            </button>
          </form>

          <div className={styles.footer}>
            <span>Already have an account? </span>
            <Link href="/">Login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignupForm;
