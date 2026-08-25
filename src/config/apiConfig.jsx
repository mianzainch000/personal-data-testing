export const apiConfig = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
  signup: "signup",
  login: "login",
  forgotPassword: "forgotPassword",
  resetPassword: "resetPassword",
  getSettings: "get-settings",
  updateSettings: "update-settings",
  verifySpecialCode: "verifySpecialCode",
  category: {
    get: "getCategories",
    post: "createCategory",
    delete: "deleteCategory",
    update: "updateCategory",
  },
  subcategory: {
    get: "getSubcategories",
    post: "createSubcategory",
    delete: "deleteSubcategory",
    update: "updateSubcategory",
  },
  item: {
    get: "getItems",
    post: "createItem",
    delete: "deleteItem",
    update: "updateItem",
    reorder: "reorderItems",
  },
};
