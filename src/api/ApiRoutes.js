// export const host = "http://localhost:4000";
export const host = "https://hombitbackend.vercel.app";

// Categories
export const createCategory = `${host}/api/v1/categories`;
export const getAllCategories = `${host}/api/v1/categories`;
export const getCategoryById = `${host}/api/v1/categories`; // id
export const updateCategoryById = `${host}/api/v1/categories`; // id

// Sub Categories
export const createSubCategory = `${host}/api/v1/subcategories`;
export const getAllSubCategories = `${host}/api/v1/subcategories`;
export const getSubCategoryById = `${host}/api/v1/subcategories`; // id
export const updateSubCategoryById = `${host}/api/v1/subcategories`; // id

// Banner
export const createcuponcode = `${host}/api/v1/cupons`;
export const getAllCuponCode = `${host}/api/v1/cupons`;
export const getCuponCodeById = `${host}/api/v1/cupons`; // id
export const updatecuponcodeById = `${host}/api/v1/cupons`; // id
 

// unit
export const createUnit = `${host}/api/v1/units`;
export const getAllUnit = `${host}/api/v1/units`;

// product
export const createProduct = `${host}/api/v1/products`;
export const getAllProduct = `${host}/api/v1/products`;
export const updateBasicDetailOfProduct = `${host}/api/v1/products`; //id

// // Admin token
// export const admintoken = `${host}/api/v1/users/register-admin-token`