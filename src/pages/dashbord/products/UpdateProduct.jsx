import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import { Button } from "@/components/ui/button";

export default function UpdateProduct({ productForUpdate, btnRef, onUpdate }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    includes: "",
    excludes: "",
    isActive: false,
  });
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  // Initialize form data and fetch categories
  useEffect(() => {
    if (productForUpdate && productForUpdate.product) {
      setFormData({
        title: productForUpdate.product.title || "",
        description: productForUpdate.product.description || "",
        category: productForUpdate.product.category?._id || "",
        includes: productForUpdate.product.includes?.join(", ") || "",
        excludes: productForUpdate.product.excludes?.join(", ") || "",
        isActive: productForUpdate.product.isActive || false,
      });
    }

    const fetchCategories = async () => {
      try {
        const response = await axiosPrivate.get("/api/v1/categories");
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories");
      }
    };

    fetchCategories();
  }, [productForUpdate, axiosPrivate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle image change
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Prepare data
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("category", formData.category);
    data.append("includes", formData.includes);
    data.append("excludes", formData.excludes);
    data.append("isActive", formData.isActive);
    if (image) {
      data.append("productImage", image);
    }

    try {
      const response = await axiosPrivate.patch(
        `/api/v1/products/${productForUpdate.product._id}`,
        data,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        onUpdate(response.data.data); // Notify parent component
        btnRef.current?.click(); // Close the sheet
      }
    } catch (error) {
      console.error("Error updating product:", error);
      const { message } = getErrorMessage(error);
      toast.error(message || "Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Update Product</h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Title and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Cleaning Service"
              required
            />
          </div>
          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={handleInputChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., This is a cleaning service"
            rows="4"
            required
          />
        </div>

        {/* Includes and Excludes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="includes"
              className="block text-sm font-medium text-gray-700"
            >
              Includes (comma-separated)
            </label>
            <input
              type="text"
              id="includes"
              value={formData.includes}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Dusting, Vacuuming"
            />
          </div>
          <div>
            <label
              htmlFor="excludes"
              className="block text-sm font-medium text-gray-700"
            >
              Excludes (comma-separated)
            </label>
            <input
              type="text"
              id="excludes"
              value={formData.excludes}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Windows, Carpets"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          {isLoading ? (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </Button>
          ) : (
            <Button type="submit">Update Product</Button>
          )}
        </div>
      </form>
    </div>
  );
}