import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import { Button } from "@/components/ui/button";
import FormHeader from "@/components/common/FormHeader";
import ProductCard from "@/components/common/ProductCard";

export default function NewScheme() {
  const [formData, setFormData] = useState({
    durationTime: "",
    price: "",
    discountPrice: "",
    timeAvailable: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const { productSlug } = useParams();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  // Fetch product if not provided via location.state
  useEffect(() => {
    if (location.state) {
      setProduct(location.state);
    } else {
      const fetchProduct = async () => {
        setProductLoading(true);
        try {
          const response = await axiosPrivate.get(
            `/api/v1/products/productbyslug/${productSlug}`
          );
          if (response.data.success) {
            setProduct(response.data.data);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          const { message } = getErrorMessage(error);
          toast.error(message || "Failed to fetch product");
        } finally {
          setProductLoading(false);
        }
      };
      fetchProduct();
    }
  }, [productSlug, location.state, axiosPrivate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate required fields
    if (!formData.durationTime || !formData.price || !formData.discountPrice) {
      toast.error("Please fill in all required fields (durationTime, price, discountPrice)");
      setIsLoading(false);
      return;
    }

    if (parseFloat(formData.price) < 0 || parseFloat(formData.discountPrice) < 0) {
      toast.error("Price and discountPrice must be non-negative");
      setIsLoading(false);
      return;
    }

    const data = {
      durationTime: parseFloat(formData.durationTime),
      price: parseFloat(formData.price),
      discountPrice: parseFloat(formData.discountPrice),
      timeAvailable: formData.timeAvailable,
    };

    try {
      const response = await axiosPrivate.patch(
        `/api/v1/products/${product._id}/addscheme`,
        data,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
          durationTime: "",
          price: "",
          discountPrice: "",
          timeAvailable: "",
        });
      }
    } catch (error) {
      console.error("Error creating scheme:", error);
      const { message } = getErrorMessage(error);
      toast.error(message || "Failed to create scheme");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle loading and error states
  if (productLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mt-7 text-center">
        <h3 className="text-lg font-medium text-gray-700">Product not found</h3>
      </div>
    );
  }

  return (
    <div>
      <FormHeader title="New Scheme" />
      <div className="w-full mt-5 mb-5 mx-auto p-5 bg-slate-50 rounded-md shadow">
        <ProductCard product={product} />
        <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
          {/* Scheme Fields */}
          <div className="mb-4 lg:flex lg:space-x-4">
            <div className="lg:w-1/4">
              <label
                htmlFor="durationTime"
                className="block text-sm font-medium mb-1"
              >
                Duration Time (minutes) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durationTime"
                value={formData.durationTime}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 60"
                required
                min="0"
              />
            </div>
            <div className="lg:w-1/4">
              <label
                htmlFor="price"
                className="block text-sm font-medium mb-1"
              >
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 100"
                required
                min="0"
              />
            </div>
            <div className="lg:w-1/4">
              <label
                htmlFor="discountPrice"
                className="block text-sm font-medium mb-1"
              >
                Discount Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 80"
                required
                min="0"
              />
            </div>
            <div className="lg:w-1/4">
              <label
                htmlFor="timeAvailable"
                className="block text-sm font-medium mb-1"
              >
                Time Available
              </label>
              <input
                type="text"
                name="timeAvailable"
                value={formData.timeAvailable}
                onChange={handleChange}
                className="border border-gray-300 rounded p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., 9AM-5PM"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            {isLoading ? (
              <Button disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </Button>
            ) : (
              <Button type="submit">Create Scheme</Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}