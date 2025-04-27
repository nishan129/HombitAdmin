import { createCategory } from "@/api/ApiRoutes";
import FormHeader from "@/components/common/FormHeader";
import { Button } from "@/components/ui/button";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function NewCategory() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isActive: true,
    categoryImage: null,
  });
  const axiosPrivate = useAxiosPrivate();
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    const data = new FormData();
    // Append form data to FormData object
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const response = await axiosPrivate.post("/api/v1/categories", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          title: "",
          description: "",
          isActive: true,
          categoryImage: null,
        });
      }
    } catch (error) {
      console.error("Error while creating category: ", error);
      const { message } = getErrorMessage(error);
      // Handle error feedback here
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <FormHeader title="New Category" />
      <div className="w-full mt-5 mb-5 mx-auto p-5 bg-slate-50 rounded-md shadow">
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
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="eg.this is very fresh"
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
              disabled
              value={formData.title.replaceAll(" ", "-").toLowerCase()}
              className="border cursor-not-allowed border-gray-300 rounded p-2 w-full"
              placeholder="eg.fresh-fruits"
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="categoryImage"
            >
              Image
            </label>
            <input
              type="file"
              id="categoryImage"
              name="categoryImage"
              onChange={handleChange}
              accept="image/*"
              required
              className="border border-gray-300 rounded w-full"
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
            <Button type="submit">Create</Button>
          ) : (
            <Button disabled>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please wait
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
