import React from "react";

export default function ProductCard({ product }) {
  return (
    <div className="flex items-center mb-6 border-b pb-4">
      <div className="ml-4">
        {/* <span
          className={`mt-2 inline-block text-sm px-2 py-1 rounded-full ${
            product.isActive
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {product.isActive ? "Active" : "Inactive"}
        </span> */}
        <p className="text-gray-700 mt-2">
          {/* <strong>Category:</strong> {product.subCategory.title} */}
        </p>
      </div>
    </div>
  );
}
