"use client";

const SearchBar = ({ value, onChange, placeholder = "Search..." }) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        maxWidth: "400px",
        padding: "12px",
        margin: "1rem 0",
        borderRadius: "8px",
        border: "1px solid var(--color-ghost-hover)",
        background: "var(--color-ghost)",
        color: "inherit",
      }}
    />
  );
};
export default SearchBar;
