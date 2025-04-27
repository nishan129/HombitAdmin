import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";

export default function UpdateCoupon({ couponForUpdate, btnRef, onUpdate }) {
  const [formData, setFormData] = useState({
    title: "",
    discount: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    if (couponForUpdate) {
      setFormData({
        title: couponForUpdate.title || "",
        discount: couponForUpdate.discount || "",
        isActive: couponForUpdate.isActive || false,
      });
    }
  }, [couponForUpdate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.discount) {
      newErrors.discount = "Discount is required";
    } else if (isNaN(formData.discount) || formData.discount < 0 || formData.discount > 100) {
      newErrors.discount = "Discount must be a number between 0 and 100";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
    
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    // Create FormData object
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });
    
    try {
      const response = await axiosPrivate.patch(
        `/api/v1/cupons/${couponForUpdate._id}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      if (response.data.success) {
        toast.success("Coupon updated successfully");
        
        // Close the modal if needed
        if (btnRef && btnRef.current) {
          btnRef.current.click();
        }
        
        // Refresh the coupon list
        if (onUpdate && typeof onUpdate === "function") {
          onUpdate();
        }
      }
    } catch (error) {
      const { message } = getErrorMessage(error);
      toast.error(`Failed to update coupon: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="title">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter coupon title"
        />
        {errors.title && (
          <p className="text-red-500 text-xs mt-1">{errors.title}</p>
        )}
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium" htmlFor="discount">
          Discount (%)
        </label>
        <input
          type="number"
          id="discount"
          name="discount"
          value={formData.discount}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md ${
            errors.discount ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter discount percentage"
          min="0"
          max="100"
        />
        {errors.discount && (
          <p className="text-red-500 text-xs mt-1">{errors.discount}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label className="text-sm font-medium" htmlFor="isActive">
          Active
        </label>
      </div>

      <div className="pt-4">
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Coupon"
          )}
        </Button>
      </div>
    </form>
  );
}