import { getAllCategories, updateSubCategoryById } from "@/api/ApiRoutes";
import { Button } from "@/components/ui/button";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function UpdateSubCategory({ subCategoryForUpdate, btnRef }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    isActive: true,
    subCategoryImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const { subCategory } = subCategoryForUpdate;
    setFormData({
      title: subCategory?.title || "",
      description: subCategory?.description || "",
      category: subCategory?.category._id || "",
      isActive: subCategory?.isActive || false,
      imageUrl: subCategory?.imageUrl || null,
    });
  }, [subCategoryForUpdate]);

  useEffect(() => {
    (async () => {
      try {
        const response = await axiosPrivate.get("/api/v1/categories");
        if (response.data.success) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.log("Error while fetching categories: ", error);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, subCategoryImage: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call for updating subcategory
    console.log(subCategoryForUpdate);
    setIsLoading(true);
    const data = new FormData();
    // Append form data to FormData object
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    try {
      const response = await axiosPrivate.patch(
        `/api/v1/subcategories/${subCategoryForUpdate.subCategory._id}`,
        data, // Use the FormData object instead of formData
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.log("Error while updating subcategory: ", error);
      const { message } = getErrorMessage(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      {/* Title and Category in one row */}
      <div className="mb-4 lg:flex lg:space-x-4">
        <div className="lg:w-1/2">
          <label className="block text-sm font-medium mb-1" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className="border border-gray-300 rounded p-2 w-full"
            placeholder="e.g. Fresh Fruits"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="lg:w-1/2">
          <label className="block text-sm font-medium mb-1" htmlFor="category">
            Categories
          </label>
          <select
            id="category"
            name="category"
            required
            className="border border-gray-300 rounded p-2 w-full"
            value={formData.category}
            onChange={handleChange}
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
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="e.g. This is fresh fruits"
          required
          value={formData.description}
          onChange={handleChange}
        />
      </div>

      {/* Slug and Image */}
      <div className="mb-4 lg:flex lg:space-x-4">
        <div className="lg:w-1/2">
          <label className="block text-sm font-medium mb-1" htmlFor="slug">
            Slug
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            className="border cursor-not-allowed border-gray-300 rounded p-2 w-full"
            placeholder="e.g. fresh-fruits"
            value={formData.title.replaceAll(" ", "-").toLowerCase()}
            disabled
          />
        </div>

        <div className="lg:w-1/2">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="SubCategoryImage"
          >
            Image(optional)
          </label>
          <input
            type="file"
            id="SubCategoryImage"
            name="SubCategoryImage"
            accept="image/*"
            className="border border-gray-300 rounded w-full"
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Is Active */}
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          className="mr-2"
          checked={formData.isActive}
          onChange={handleChange}
        />
        <label className="text-sm font-medium" htmlFor="isActive">
          Is Active?
        </label>
      </div>

      {/* Submit Button */}
      {!isLoading ? (
        <Button type="submit">Update</Button>
      ) : (
        <Button disabled>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Please wait
        </Button>
      )}
    </form>
  );
}
