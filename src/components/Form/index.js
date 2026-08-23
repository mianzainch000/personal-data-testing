"use client";
import Loader from "@/components/Loader";
import Button from "@/components/Button";
import styles from "@/css/Form.module.css";
import { useState, useEffect } from "react";

const Form = ({
  title = "Form",
  fields = [],
  onSubmit,
  initialData = null,
  showInitially = false,
  onCancelEdit,
}) => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(showInitially);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setShowForm(true);
    }
  }, [initialData]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!onSubmit) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({});
      setShowForm(false);
      if (onCancelEdit) onCancelEdit();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({});
    setShowForm(false);
    if (onCancelEdit) onCancelEdit();
  };

  return (
    <>
      {loading && <Loader />}
      {!showForm && (
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
          className={styles.addButton}
        >
          ➕ {title}
        </Button>
      )}

      {showForm && (
        <div className={styles.overlay}>
          <div className={styles.formCard}>
            <Button
              onClick={handleClose}
              variant="danger"
              className={styles.closeButton}
            >
              ✖
            </Button>
            <h2>{title}</h2>
            <form className={styles.form} onSubmit={handleSubmit}>
              {fields.map((field) =>
                field.type === "textarea" ? (
                  <div key={field.key}>
                    <label>{field.label}</label>
                    <textarea
                      placeholder={field.placeholder || ""}
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        handleChange(field.key, e.target.value)
                      }
                      required={field.required}
                      rows={field.rows || 4}
                    />
                  </div>
                ) : (
                  <div key={field.key}>
                    <label>{field.label}</label>
                    <input
                      type={field.type || "text"}
                      placeholder={field.placeholder || ""}
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        handleChange(field.key, e.target.value)
                      }
                      required={field.required}
                    />
                  </div>
                ),
              )}
              <Button type="submit" className={styles.submitButton}>
                {initialData ? "Update" : "Submit"}
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Form;
