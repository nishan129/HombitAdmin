import FormHeader from "@/components/common/FormHeader";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { createProduct, getAllProduct } from "@/api/ApiRoutes";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";

export default function NewProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    includes: "",
    excludes: "",
    isActive: false,
    schemes: [{ durationTime: 0, price: 0, discountPrice: 0, timeAvailable: "" }],
  });

  const [categories, setCategories] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    (async () => {
      const categoriesResponse = await axiosPrivate.get("/api/v1/categories");
      if (categoriesResponse.data.success) {
        setCategories(categoriesResponse.data.data);
      }
    })();
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSchemeChange = (e) => {
  const { id, value } = e.target;
  let processedValue = value;

  // Convert to number if the field is expected to be numeric
  if (id === "durationTime" || id === "price" || id === "discountPrice") {
    // Use parseFloat to allow for decimal prices, or parseInt if only whole numbers are expected.
    // Handle empty string case to avoid NaN if user clears the input, defaulting to 0 or an empty string based on your preference for state.
    // If you want to allow empty input to clear to 0, use:
    processedValue = value === "" ? 0 : parseFloat(value);
    // If you prefer to keep it as an empty string until submit (and convert on submit),
    // then you'd convert on submit. But for type consistency in state, converting here is good.
    // Let's go with parseFloat and default to 0 if empty or invalid.
    const numValue = parseFloat(value);
    processedValue = isNaN(numValue) ? 0 : numValue; // Or handle NaN differently if needed
  }

  setFormData((prev) => ({
    ...prev,
    schemes: [{ ...prev.schemes[0], [id]: processedValue }],
  }));
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  // Create a deep copy of schemes to modify
  const processedSchemes = formData.schemes.map(scheme => ({
    ...scheme,
    durationTime: parseFloat(scheme.durationTime) || 0, // Ensure it's a number, default to 0 if parsing fails
    price: parseFloat(scheme.price) || 0,
    discountPrice: parseFloat(scheme.discountPrice) || 0,
    // timeAvailable is already a string, so no change needed
  }));

  const data = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    includes: formData.includes.split(",").map(item => item.trim()).filter(item => item), // Use map to trim before filter
    excludes: formData.excludes.split(",").map(item => item.trim()).filter(item => item), // Use map to trim before filter
    isActive: formData.isActive,
    schemes: processedSchemes, // Use the processed schemes
  };

  console.log("Form Data before submission (raw):", formData); // Keep this for debugging raw state
  console.log("Sending request to:", createProduct);
  console.log("Request data (processed):", data); // Log the data being sent

  if (!data.category || data.category === "") {
    toast.error("Please select a category");
    setIsLoading(false);
    return;
  }

  // Client-side validation for scheme numbers (after conversion)
  if (!data.schemes || data.schemes.length === 0 ||
      data.schemes[0].durationTime == null || data.schemes[0].durationTime < 0 || // Check for null/undefined and negative
      data.schemes[0].price == null || data.schemes[0].price < 0 ||
      data.schemes[0].discountPrice == null || data.schemes[0].discountPrice < 0) {
    toast.error("Please fill in all scheme details (durationTime, price, discountPrice) with valid non-negative numbers.");
    setIsLoading(false);
    return;
  }
  // ... rest of your handleSubmit function
  try {
    const response = await axiosPrivate.post(createProduct, data, {
      headers: { "Content-Type": "application/json" },
    });
    if (response.data.success) {
      toast.success(response.data.message);
      setFormData({
        title: "",
        description: "",
        category: "",
        includes: "",
        excludes: "",
        isActive: false,
        schemes: [{ durationTime: 0, price: 0, discountPrice: 0, timeAvailable: "" }],
      });
    }
  } catch (error) {
    console.error("Error while creating service:", error);
    const { message } = getErrorMessage(error); // Ensure getErrorMessage can handle Axios errors
    toast.error(message || "Server error occurred. Please check console.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div>
      <FormHeader title="New Service" />
      <div className="w-full mt-5 mb-5 mx-auto p-5 bg-slate-50 rounded-md shadow">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="mb-4 lg:flex lg:space-x-4">
            <div className="lg:w-1/3">
              <label className="block text-sm font-medium mb-1" htmlFor="title">
                Title
              </label>
              <input
                type="text"
                id="title"
                placeholder="Cleaning"
                value={formData.title}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
                required
              />
            </div>
            <div className="lg:w-1/3">
              <label className="block text-sm font-medium mb-1" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
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

          <div className="mb-4 lg:flex lg:space-x-4">
            <div className="lg:w-1/2">
              <label className="block text-sm font-medium mb-1" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                placeholder="e.g., This is a cleaning service"
                value={formData.description}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
                required
              ></textarea>
            </div>
          </div>

          <div className="mb-4 lg:flex lg:space-x-4">
            <div className="lg:w-1/2">
              <label className="block text-sm font-medium mb-1" htmlFor="includes">
                Includes (comma-separated)
              </label>
              <input
                type="text"
                id="includes"
                placeholder="e.g., Dusting, Vacuuming"
                value={formData.includes}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
              />
            </div>
            <div className="lg:w-1/2">
              <label className="block text-sm font-medium mb-1" htmlFor="excludes">
                Excludes (comma-separated)
              </label>
              <input
                type="text"
                id="excludes"
                placeholder="e.g., Windows, Carpets"
                value={formData.excludes}
                onChange={handleInputChange}
                className="border border-gray-300 rounded p-2 w-full"
              />
            </div>
          </div>

          <div className="mb-4 lg:flex lg:space-x-4">
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium mb-1" htmlFor="durationTime">
                Duration Time (minutes)
              </label>
              <input
                type="number"
                id="durationTime"
                value={formData.schemes[0].durationTime}
                onChange={handleSchemeChange}
                className="border border-gray-300 rounded p-2 w-full"
                required
              />
            </div>
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium mb-1" htmlFor="price">
                Price
              </label>
              <input
                type="number"
                id="price"
                value={formData.schemes[0].price}
                onChange={handleSchemeChange}
                className="border border-gray-300 rounded p-2 w-full"
                required
              />
            </div>
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium mb-1" htmlFor="discountPrice">
                Discount Price
              </label>
              <input
                type="number"
                id="discountPrice"
                value={formData.schemes[0].discountPrice}
                onChange={handleSchemeChange}
                className="border border-gray-300 rounded p-2 w-full"
                required
              />
            </div>
            <div className="lg:w-1/4">
              <label className="block text-sm font-medium mb-1" htmlFor="timeAvailable">
                Time Available
              </label>
              <input
                type="text"
                id="timeAvailable"
                value={formData.schemes[0].timeAvailable}
                onChange={handleSchemeChange}
                className="border border-gray-300 rounded p-2 w-full"
              />
            </div>
          </div>

          <div className="mb-4 lg:flex lg:space-x-4 items-end w-full">
            <div className="lg:w-1/4 flex items-center">
              <input
                type="checkbox"
                className="mr-2"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              <label className="text-sm font-medium" htmlFor="isActive">
                Active
              </label>
            </div>
          </div>

          {!isLoading ? (
            <Button type="submit">Create Service</Button>
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