import CategoryClientWrapper from "./template";

const ManageCategoriesPage = () => {
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ textAlign: "center", padding: "0 1rem" }}>
        <h1>🗂️ Manage Categories</h1>
      </div>

      <CategoryClientWrapper />
    </div>
  );
};

export default ManageCategoriesPage;

export function generateMetadata() {
  return { title: "Manage Categories" };
}
