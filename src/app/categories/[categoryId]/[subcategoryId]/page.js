import CategoryExplorer from "@/components/CategoryExplorer";

const SubcategoryViewPage = async ({ params }) => {
  const { categoryId, subcategoryId } = await params;
  return (
    <CategoryExplorer categoryId={categoryId} subcategoryId={subcategoryId} />
  );
};

export default SubcategoryViewPage;

export function generateMetadata() {
  return { title: "Subcategory" };
}
