import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"; // Assuming this hook exists
import { formatDate } from "@/utility/formateDate"; // Assuming this utility exists
import { getErrorMessage } from "@/utility/getErrorMessage"; // Assuming this utility exists
// import FormHeader from "@/components/common/FormHeader"; // Optional header

// Icon for copying (replace with your preferred icon library if needed)
const CopyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 inline ml-1"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

export default function orderDetails() {
  // Using orderId from params as per original code, assuming it holds the order ID
  const { orderId: orderId } = useParams();
  const [order, setorder] = useState(null); // Use null initially
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const [copiedStatus, setCopiedStatus] = useState({ lat: false, lng: false });

  useEffect(() => {
    // Reset copied status when orderId changes
    setCopiedStatus({ lat: false, lng: false });

    if (orderId) {
      (async () => {
        setIsLoading(true); // Set loading true at the start of fetch
        try {
          // Adjust API endpoint if needed
          const response = await axiosPrivate.get(
            `api/v1/orders/${orderId}`
          );
          console.log("order-->", response.data.data);
          setorder(response.data.data);
        } catch (error) {
          console.error("Error while fetching order: ", error);
          const message = getErrorMessage(error); // Use 'let' or 'const'
          toast.error(`Failed to fetch order: ${message}`);
          setorder(null); // Ensure order is null on error
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      setIsLoading(false); // No ID, stop loading
      setorder(null);
    }
  }, [orderId, axiosPrivate]); // Add axiosPrivate to dependency array

  const handleCopy = async (textToCopy, type) => {
    if (!navigator.clipboard) {
      toast.error("Clipboard API not available in your browser.");
      return;
    }
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success(`${type} copied to clipboard!`);
      setCopiedStatus((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => setCopiedStatus((prev) => ({ ...prev, [type]: false })), 2000); // Reset after 2s
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy to clipboard.");
    }
  };

  if (isLoading) {
    return <p className="text-center mt-10">Loading order details...</p>;
  }

  if (!order) {
    return <p className="text-center mt-10">order not found!</p>;
  }

  // --- Safely access nested properties ---
  const address = order.serviceAddress || {};
  const property = order.propertyDetails || {};
  const latitude = address.latitude; // Assuming latitude is in serviceAddress
  const longitude = address.longitude; // Assuming longitude is in serviceAddress

  return (
    <>
      {/* <FormHeader title={"order Detail"} /> */}
      <div className="max-w-5xl mx-auto p-6 mt-5 bg-white shadow-lg rounded-md">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-4 border-b">
          <h1 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">
            order Details
          </h1>
          <div className="text-left sm:text-right text-sm">
            <p className="text-gray-600">
              <span className="font-semibold">order ID:</span> {order._id}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Booked On:</span>{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>
        </header>

        {/* Customer & Service Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Customer Details */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Customer Details
            </h2>
            <div className="text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">Name:</span>{" "}
                {order.userFullName || "N/A"}
              </p>
              <p>
                <span className="font-semibold">Phone:</span>{" "}
                {order.userPhone ? `+91 ${order.userPhone}` : "N/A"}
              </p>
              {/* Add Email if available in your data */}
              {/* <p><span className="font-semibold">Email:</span> {order.userEmail || 'N/A'}</p> */}
            </div>
          </section>

          {/* Service Details */}
          <section>
            <h2 className="text-lg font-semibold text-gray-700 mb-3">
              Service Details
            </h2>
            <div className="text-gray-700 space-y-1">
              <p>
                <span className="font-semibold">Service Date:</span>{" "}
                {order.serviceDate ? formatDate(order.serviceDate, { dateOnly: true }) : "N/A"}
              </p>
              <p>
                <span className="font-semibold">Time Slot:</span>{" "}
                {order.serviceTimeSlot || "N/A"}
              </p>
               <p>
                <span className="font-semibold">Status:</span>{" "}
                <span className={`font-medium ${
                    order.orderStatus === 'Pending' ? 'text-orange-600' :
                    order.orderStatus === 'Confirmed' ? 'text-blue-600' :
                    order.orderStatus === 'Completed' ? 'text-green-600' :
                    order.orderStatus === 'Cancelled' ? 'text-red-600' :
                    'text-gray-600' // Default
                }`}>
                    {order.orderStatus || "N/A"}
                 </span>
              </p>
            </div>
          </section>
        </div>

        {/* Service Address & Property Details Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Service Address */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                    Service Address
                </h2>
                <div className="text-gray-700 space-y-1">
                <p>
                    <span className="font-semibold">Address:</span>{" "}
                    {`${address.street || ""}, ${address.city || ""}, ${
                    address.state || ""
                    }, ${address.postalCode || ""}`}
                </p>
                 {/* Latitude */}
                 <div className="flex items-center space-x-2">
                     <span className="font-semibold">Latitude:</span>
                    <span>{latitude ?? "Not Available"}</span>
                     {latitude && (
                        <button
                            onClick={() => handleCopy(latitude, "lat")}
                            className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
                            title="Copy Latitude"
                        >
                            {copiedStatus.lat ? "Copied!" : <CopyIcon />}
                        </button>
                     )}
                 </div>
                 {/* Longitude */}
                 <div className="flex items-center space-x-2">
                     <span className="font-semibold">Longitude:</span>
                     <span>{longitude ?? "Not Available"}</span>
                     {longitude && (
                        <button
                         onClick={() => handleCopy(longitude, "lng")}
                         className="text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
                         title="Copy Longitude"
                        >
                           {copiedStatus.lng ? "Copied!" : <CopyIcon />}
                        </button>
                     )}
                 </div>
                </div>
            </section>

            {/* Property Details */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">
                 Property Details
                </h2>
                <div className="text-gray-700 space-y-1">
                <p>
                    <span className="font-semibold">Bedrooms:</span>{" "}
                    {property.bedrooms ?? "N/A"}
                </p>
                <p>
                    <span className="font-semibold">Bathrooms:</span>{" "}
                    {property.bathrooms ?? "N/A"}
                </p>
                {/* Add other property details if needed */}
                </div>
            </section>
        </div>


        {/* Payment Info & Summary Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Payment Info */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Payment Info</h2>
                <div className="text-gray-700 space-y-1">
                <p>
                    <span className="font-semibold">Payment Status:</span>{" "}
                    <span
                    className={`font-medium ${
                        order.isPaid ? "text-green-700" : "text-red-700"
                    }`}
                    >
                    {order.isPaid ? "Paid" : "Not Paid"}
                    </span>
                </p>
                {order.isPaid && order.paidAt && (
                    <p>
                    <span className="font-semibold">Paid At:</span>{" "}
                    {formatDate(order.paidAt)}
                    </p>
                )}
                </div>
            </section>

             {/* Summary */}
            <section>
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Summary</h2>
                <div className="mt-2 text-gray-700 space-y-1 text-lg">
                    <div className="flex justify-between font-bold ">
                        <span>Total Amount:</span>
                        {/* Assuming currency is INR (₹) */}
                        <span>
                            ₹{order.totalAmount?.toFixed(2) ?? "0.00"}
                        </span>
                    </div>
                </div>
            </section>
         </div>

        {/* Footer */}
        <footer className="text-center mt-8 border-t pt-4">
          <p className="text-gray-500 text-sm">
            Thank you for your order. If you have any questions, contact us at{" "}
            <a href="mailto:support@example.com" className="text-blue-500 hover:underline">
              support@example.com
            </a>{" "}
            {/* Update email */}
          </p>
        </footer>
      </div>
    </>
  );
}