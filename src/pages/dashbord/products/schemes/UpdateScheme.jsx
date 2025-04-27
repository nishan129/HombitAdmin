import { Button } from "@/components/ui/button";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const UpdateScheme = ({ schemeForUpdate, product }) => {
  const [formData, setFormData] = useState({
    durationTime: "",
    price: 0,
    discountPrice: 0,
    timeAvailable: "",
    schemeId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    if (schemeForUpdate?.scheme) {
      setFormData({
        durationTime: schemeForUpdate.scheme.durationTime || "",
        price: schemeForUpdate.scheme.price || 0,
        discountPrice: schemeForUpdate.scheme.discountPrice || 0,
        timeAvailable: schemeForUpdate.scheme.timeAvailable || "",
        schemeId: schemeForUpdate.scheme._id || "",
      });
    }
  }, [schemeForUpdate]);

  // Handle change for all fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit data to server
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const data = new FormData();
    // Append form data
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const response = await axiosPrivate.patch(
        `/api/v1/products/${product._id}/updatescheme`,
        data,
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
      const { message } = getErrorMessage(error);
      console.error("Error while updating scheme: ", error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Duration Time Field */}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Duration Time <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="durationTime"
              value={formData.durationTime}
              onChange={handleChange}
              placeholder="e.g., 30 days"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
            />
          </div>

          {/* Price Field */}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              required
              min={0}
              step="0.01"
            />
          </div>

          {/* Discount Price Field */}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Discount Price
            </label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
              min={0}
              step="0.01"
            />
          </div>

          {/* Time Available Field */}
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">
              Time Available
            </label>
            <input
              type="text"
              name="timeAvailable"
              value={formData.timeAvailable}
              onChange={handleChange}
              placeholder="e.g., 9AM-5PM"
              className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            />
          </div>
        </div>

        {/* Submit Button */}
        {!isLoading ? (
          <Button type="submit">Update Scheme</Button>
        ) : (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        )}
      </form>
    </div>
  );
};

export default UpdateScheme;