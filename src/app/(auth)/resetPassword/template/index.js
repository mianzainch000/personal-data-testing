"use client";
import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import Loader from "@/components/Loader";
import styles from "@/css/Auth.module.css";
import { apiConfig } from "@/config/apiConfig";
import { useSearchParams } from "next/navigation";
import { useSnackbar } from "@/components/Snackbar";
import handleAxiosError from "@/components/HandleAxiosError";

const ResetPassword = () => {
  const showAlert = useSnackbar();
  const searchParams = useSearchParams();
  const token = searchParams?.get("token") || "";

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSpecialCode, setShowSpecialCode] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
    specialCode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { password, confirmPassword } = formData;

    if (password !== confirmPassword) {
      showAlert({
        message: "❌Pasword or Confirm Password not match",
        type: "error",
      });
      return;
    }

    await ResetPasswordApi();
  };

  const ResetPasswordApi = async () => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${apiConfig.baseUrl}${apiConfig.resetPassword}/${token}`,
        {
          newPassword: formData.password,
          newSpecialCode: formData.specialCode,
          token: token,
        },
      );
      if (res?.status === 200) {
        showAlert({
          message: res?.data?.message,
          type: "success",
        });
        setFormData({
          password: "",
          confirmPassword: "",
          specialCode: "",
        });
      } else {
        showAlert({
          message: res?.data.message,
          type: "error",
        });
      }
    } catch (error) {
      const { message } = handleAxiosError(error);
      showAlert({
        message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <div className={styles.authContainer}>
        <div className={styles.card}>
          <h2 className={styles.title}>New Password</h2>
          <p className={styles.subtitle}>
            Create a strong password for your account
          </p>

          <form onSubmit={handleSubmit}>
            {}
            <div className={styles.formGroup}>
              <label className={styles.label}>New Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder={showPassword ? "1234..." : "••••••••"}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {}
            <div className={styles.formGroup}>
              <label className={styles.label}>Confirm Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  className={styles.input}
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="off"
                  placeholder={showConfirmPassword ? "1234..." : "••••••••"}
                />
                <button
                  type="button"
                  className={styles.togglePassword}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? "HIDE" : "SHOW"}
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

            {}
            <button type="submit" className={styles.button}>
              Update Password
            </button>
          </form>

          <div className={styles.footer}>
            <Link href="/">Back to login</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
