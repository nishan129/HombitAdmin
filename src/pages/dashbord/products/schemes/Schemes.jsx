import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import PageHeader from "@/components/common/PageHeader";
import ProductCard from "@/components/common/ProductCard";
import UpdateSheet from "@/components/common/UpdateSheet";
import UpdateScheme from "./UpdateScheme";
import { TablePagination } from "@/components/common/TablePagination";
import { Button } from "@/components/ui/button";

export default function Schemes() {
  const { productSlug } = useParams();
  const [productLoading, setProductLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [schemeForUpdate, setSchemeForUpdate] = useState({
    isOpen: false,
    scheme: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const schemesPerPage = 6;
  const btnRef = useRef(null);
  const axiosPrivate = useAxiosPrivate();

  // Fetch product by slug
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productSlug) {
        setError("Invalid product slug");
        setProductLoading(false);
        return;
      }

      setProductLoading(true);
      try {
        const response = await axiosPrivate.get(`/api/v1/products/productbyslug/${productSlug}`);
        if (response?.data?.success) {
          setProduct(response.data.data);
          setError(null);
        } else {
          setProduct(null);
          setError(response?.data?.message || "Product not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        const { message } = getErrorMessage(error);
        setError(message || "Failed to fetch product");
        setProduct(null);
      } finally {
        setProductLoading(false);
      }
    };

    fetchProduct();
  }, [productSlug, axiosPrivate]);

  // Handle scheme deletion
  const handleDelete = async (schemeId) => {
    if (!window.confirm("Are you sure you want to delete this scheme?")) return;

    try {
      const response = await axiosPrivate.delete(
        `/api/v1/products/${product._id}/deletescheme`,
        { data: { schemesId: schemeId } }
      );
      if (response.data.success) {
        setProduct({
          ...product,
          schemes: product.schemes.filter((scheme) => scheme._id !== schemeId),
        });
        toast.success("Scheme deleted successfully");
      } else {
        toast.error(response?.data?.message || "Failed to delete scheme");
      }
    } catch (error) {
      console.error("Error deleting scheme:", error);
      const { message } = getErrorMessage(error);
      toast.error(message || "Failed to delete scheme");
    }
  };

  // Calculate paginated schemes
  const indexOfLastScheme = currentPage * schemesPerPage;
  const indexOfFirstScheme = indexOfLastScheme - schemesPerPage;
  const currentSchemes = product?.schemes?.slice(indexOfFirstScheme, indexOfLastScheme) || [];

  // Handle loading state
  if (productLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" aria-label="Loading product" />
      </div>
    );
  }

  // Handle error state
  if (error || !product) {
    return (
      <div className="mt-7 text-center">
        <h3 className="text-lg font-medium text-gray-700">{error || "Product not found"}</h3>
        <Button
          onClick={() => setProductLoading(true)} // Trigger re-fetch
          className="mt-4"
          aria-label="Retry fetching product"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Update Sheet for editing scheme */}
      <UpdateSheet btnRef={btnRef} title="Update Product Scheme">
        {schemeForUpdate.isOpen && (
          <UpdateScheme
            product={product}
            schemeForUpdate={schemeForUpdate}
            onUpdate={(updatedSchemes) => {
              setProduct({ ...product, schemes: updatedSchemes });
              setSchemeForUpdate({ isOpen: false, scheme: null });
            }}
          />
        )}
      </UpdateSheet>

      {/* Page Header */}
      <PageHeader
        heading="Schemes"
        LinkTitle="Add Scheme"
        href={`/dashboard/products/${product.slug}/schemes/new`}
        data={product}
      />

      {/* Product and Schemes Section */}
      <div className="w-full mt-5 mb-5 mx-auto p-5 bg-slate-50 rounded-md shadow">
        <ProductCard product={product} />

        <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-4">
          Available Schemes
        </h3>

        {product.schemes.length === 0 ? (
          <p className="text-gray-500 text-center">No schemes available</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSchemes.map((scheme) => (
                <div
                  key={scheme._id}
                  className="bg-white rounded-lg p-4 shadow-md transition-transform hover:scale-105"
                >
                  <div className="mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">
                      Duration: {scheme.durationTime} minutes
                    </h4>
                    <p className="text-sm text-gray-500">
                      {scheme.timeAvailable || "Anytime"}
                    </p>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-600 font-bold">₹{scheme.price}</span>
                    <span className="text-sm text-gray-600">
                      Discount: ₹{scheme.discountPrice}
                    </span>
                  </div>
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSchemeForUpdate({ isOpen: true, scheme });
                        btnRef.current?.click();
                      }}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={`Edit scheme for ${scheme.durationTime} minutes`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(scheme._id)}
                      className="text-white bg-red-500 hover:bg-red-600"
                      aria-label={`Delete scheme for ${scheme.durationTime} minutes`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <TablePagination
              totalItems={product.schemes.length}
              itemsPerPage={schemesPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}