import CategoryClientWrapper from "./template";

const ManageCategoriesPage = () => {
  return (
    <div style={{ padding: "1.5rem 0" }}>
      <div style={{ textAlign: "center", padding: "0 1rem" }}>
        <h1>🗂️ Manage Categories</h1>
        <p>
          Step 1: select or create a Category. Step 2: select or create a Sub
          Heading. Step 3 &amp; 4: add and manage as many detail cards as you
          want.
        </p>
      </div>

      <CategoryClientWrapper />
    </div>
  );
};

export default ManageCategoriesPage;

export function generateMetadata() {
  return { title: "Manage Categories" };
}
