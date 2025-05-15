import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import UpdateSheet from "@/components/common/UpdateSheet";
import UpdateProduct from "./UpdateProduct";
import { TablePagination } from "@/components/common/TablePagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export default function ProductTable() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productForUpdate, setProductForUpdate] = useState({
    isOpen: false,
    product: null,
  });
  const axiosPrivate = useAxiosPrivate();
  const btnRef = useRef(null);
  const navigate = useNavigate();

  // Fetch products on mount
  const [paginationInfo, setPaginationInfo] = useState({
  totalProducts: 0,
  page: 1,
  limit: 10, // Or whatever your default is
});

// Fetch products on mount
useEffect(() => {
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      // If your API supports pagination, you'd pass page and limit here
      // const response = await axiosPrivate.get(`/api/v1/products?page=${paginationInfo.page}&limit=${paginationInfo.limit}`);
      const response = await axiosPrivate.get("/api/v1/products"); // Assuming default fetch for now

      if (response.data.success && response.data.data) {
        if (Array.isArray(response.data.data)) {
          setProducts(response.data.data);
          setPaginationInfo({
            totalProducts: response.data.data.totalProducts,
            page: response.data.data.page,
            limit: response.data.data.limit,
          });
        } else {
          console.error("Fetched data.products is not an array:", response.data.data.products);
          setProducts([]); // Fallback to an empty array
          toast.error("Received invalid product data from server.");
        }
      } else {
         toast.error("Failed to fetch products or no data received.");
         setProducts([]); // Fallback
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      const { message } = getErrorMessage(error);
      toast.error(message || "Failed to fetch products");
      setProducts([]); // Fallback in case of error
    } finally {
      setIsLoading(false);
    }
  };

  fetchProducts();
  // Add paginationInfo.page and paginationInfo.limit to dependencies if you implement page changes
}, [axiosPrivate]);

  // Handle product deletion
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await axiosPrivate.delete(`/api/v1/products/${productId}`);
      if (response.data.success) {
        setProducts(products.filter((product) => product._id !== productId));
        toast.success("Product deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      const { message } = getErrorMessage(error);
      toast.error(message || "Failed to delete product");
    }
  };

  return (
    <div className="p-4">
      {/* Update Sheet for editing product */}
      <UpdateSheet btnRef={btnRef} title="Update Product Basic Details">
        {productForUpdate.isOpen && (
          <UpdateProduct
            btnRef={btnRef}
            productForUpdate={productForUpdate}
            onUpdate={(updatedProduct) => {
              setProducts(
                products.map((p) =>
                  p._id === updatedProduct._id ? updatedProduct : p
                )
              );
              setProductForUpdate({ isOpen: false, product: null });
            }}
          />
        )}
      </UpdateSheet>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <>
          {/* Product Table */}
          <div className="overflow-x-auto mt-7">
            <table className="w-full border-collapse border border-gray-200 bg-white text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left font-medium text-gray-700 border border-gray-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 rounded"
                      aria-label="Select all products"
                    />
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 border border-gray-200">
                    Product Name
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 border border-gray-200">
                    Category
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 border border-gray-200">
                    Schemes
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 border border-gray-200">
                    Active
                  </th>
                  <th className="p-3 text-left font-medium text-gray-700 border border-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr
                      key={product._id}
                      className="border border-gray-200 hover:bg-gray-50"
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 rounded"
                          aria-label={`Select ${product.title}`}
                        />
                      </td>
                      <td className="p-3">{product.title}</td>
                      <td className="p-3">
                        {product.category?.title || "N/A"}
                      </td>
                      <td className="p-3">
                        <Select>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue
                              placeholder={`${product.schemes?.length || 0} Schemes`}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {product.schemes?.map((scheme, index) => (
                              <SelectItem
                                key={scheme._id || index}
                                value={scheme._id}
                              >
                                {`${scheme.durationTime} min, ₹${scheme.price} (₹${scheme.discountPrice} disc.)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3">
                        {product.isActive ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-red-600">No</span>
                        )}
                      </td>
                      <td className="p-3 flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProductForUpdate({
                              isOpen: true,
                              product,
                            });
                            btnRef.current?.click();
                          }}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product._id)}
                          className="text-white bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate(`/dashboard/products/${product.slug}/schemes`, {
                              state: product,
                            });
                          }}
                          className="text-green-600 hover:text-green-800"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <TablePagination totalItems={products.length} />
        </>
      )}
    </div>
  );
}