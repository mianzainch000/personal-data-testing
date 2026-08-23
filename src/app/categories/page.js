import Categories from "@/components/CategoriesRoutes";

const CategoriesRoutes = () => {
  return <Categories />;
};

export default CategoriesRoutes;

export function generateMetadata() {
  return { title: "Categories" };
}
