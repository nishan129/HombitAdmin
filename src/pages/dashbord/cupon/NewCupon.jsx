import { createcuponcode } from "@/api/ApiRoutes";
import FormHeader from "@/components/common/FormHeader";
import { Button } from "@/components/ui/button";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function NewCupon() {
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (!formData.discount) {
      toast.error("Discount is required");
      return;
    }
    
    setIsLoading(true);

    try {
      // Since title must be unique in the database
      const response = await axiosPrivate.post("/api/v1/cupons", {
        title: formData.title.trim(),
        discount: formData.discount.toString(), // Ensure discount is sent as a string as per schema
        isActive: formData.isActive
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          title: "",
          discount: "",
          isActive: true,
        });
      }
    } catch (error) {
      console.error("Error while creating cupon: ", error);
      
      // Check if there's a MongoDB duplicate key error for title
      if (error.response?.status === 500 && error.response?.data?.message?.includes("duplicate key error")) {
        toast.error("A coupon with this title already exists. Please use a different title.");
      } else {
        const { message } = getErrorMessage(error);
        toast.error(message || "Failed to create coupon");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <FormHeader title="New Cupon" />
      <div className="w-full mt-5 mb-5 mx-auto p-5 bg-slate-50 rounded-md shadow">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter unique coupon title/code"
            />
            <p className="text-xs text-gray-500 mt-1">
              This must be unique and will be used as the coupon code
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1" htmlFor="discount">
              Discount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              required
              className="border border-gray-300 rounded p-2 w-full"
              placeholder="Enter discount percentage"
              min={0}
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
            <Button type="submit">Create Cupon</Button>
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