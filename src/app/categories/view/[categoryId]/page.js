import CategoryExplorer from "@/components/CategoryExplorer";

const CategoryViewPage = async ({ params }) => {
  const { categoryId } = await params;
  return <CategoryExplorer categoryId={categoryId} />;
};

export default CategoryViewPage;

export function generateMetadata() {
  return { title: "Category" };
}
