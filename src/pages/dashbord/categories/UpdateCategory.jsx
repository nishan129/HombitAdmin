import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateCategoryById } from "@/api/ApiRoutes";
import axios from "axios";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";

export default function UpdateCategory({ categoryForUpdate }) {
  console.log(categoryForUpdate);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
    categoryImage: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    const { category } = categoryForUpdate;
    console.log(category);
    setFormData({
      title: category.title,
      description: category.description,
      isActive: category.isActive,
      imageUrl: category.imageUrl,
    });
  }, [categoryForUpdate]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setFormData((prev) => ({ ...prev, categoryImage: files[0] }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // API call for updating subcategory
    console.log(categoryForUpdate);
    setIsLoading(true);
    const data = new FormData();
    // Append form data to FormData object
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    try {
      const response = await axiosPrivate.patch(
        `/api/v1/categories/${categoryForUpdate.category._id}`,
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
      console.log("Error while updating category: ", error);
      const { message } = getErrorMessage(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="title">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="eg.Fresh Fruits"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="eg.this is fresh fruits"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" htmlFor="slug">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          name="slug"
          value={formData.title.replaceAll(" ", "-").toLowerCase()}
          className="border border-gray-300 rounded p-2 w-full"
          placeholder="eg.fresh-fruits"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-medium mb-1"
          htmlFor="categoryImage"
        >
          Image(optional)
        </label>
        <input
          type="file"
          id="categoryImage"
          name="categoryImage"
          onChange={handleChange}
          accept="image/*"
          className="border border-gray-300 rounded w-full"
          placeholder="image is optional"
        />
      </div>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm font-medium" htmlFor="isActive">
          Is Active?
        </label>
      </div>

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
