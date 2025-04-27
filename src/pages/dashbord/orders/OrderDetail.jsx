import FormHeader from "@/components/common/FormHeader";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { formatDate } from "@/utility/formateDate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

export default function OrderDetails() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    if (orderId) {
      (async () => {
        try {
          const response = await axiosPrivate.get(`api/v1/orders/${orderId}`);
          console.log("order-->", response.data.data);
          setOrder(response.data.data);
        } catch (error) {
          console.log("Error while fetching order: ", error);
          const { message } = getErrorMessage(error);
          toast.error(message);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [orderId]);

  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }
  if (!isLoading && !order) {
    return <p className="text-center">Order not found!</p>;
  }
  return (
    <>
      {/* <FormHeader title={"Order Detail"} /> */}
      <div className="max-w-5xl  mx-auto p-6 mt-5 bg-white shadow-lg rounded-md">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
          <div className="text-right">
            <p className="text-gray-600">
              <span className="font-bold">Order ID:</span> {order._id}
            </p>
            <p className="text-gray-600">
              <span className="font-bold">Date:</span>{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>
        </header>

        {/* Customer Details */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">
            Customer Details
          </h2>
          <div className="mt-2 text-gray-600">
            <p>
              <span className="font-bold">Name:</span>{" "}
              {order.userFullName || "Grozzo user"}
            </p>
            <p>
              <span className="font-bold">Email:</span>{" "}
              {order.userEmail || "exampl@grozzo.com"}
            </p>
            <p>
              <span className="font-bold">Phone:</span> +91 {order.userMo}
            </p>
            <p>
              <span className="font-bold">Shipping Address:</span>{" "}
              {`${order.shippingAddress.street}, ${
                order.shippingAddress.city
              }, ${order.shippingAddress.state}, ${
                order.shippingAddress.postalCode
              } ${
                order.shippingAddress.additionalInfo
                  ? `(${order.shippingAddress.additionalInfo})`
                  : ""
              }`}
            </p>
          </div>
        </section>

        {/* Order Items */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Ordered Items</h2>
          <div className="mt-4 space-y-4">
            {/* Items */}
            {order.orderItems.map((orderItem) => {
              const {
                quantityToBuy,
                partialQuantity,
                qty,
                unit,
                price,
                title,
                imageUrl,
              } = orderItem;

              // Calculate the total price for each item, including partial quantity
              const totalItemPrice =
                price * quantityToBuy +
                (partialQuantity ? (price / qty) * partialQuantity : 0);

              return (
                <div
                  key={orderItem._id}
                  className="flex items-center justify-between border p-1 md:p-4 rounded-md bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={imageUrl}
                      alt={title}
                      className="w-20 h-20 rounded-md"
                    />
                    <div>
                      <p className="font-bold text-gray-800">{title}</p>
                      <p className="text-gray-600 text-sm">
                        Qty: {quantityToBuy}
                      </p>
                      {partialQuantity > 0 && (
                        <p className="text-gray-600 text-sm">
                          Partial Qty: {partialQuantity} {unit}
                        </p>
                      )}
                      <p className="text-gray-600 text-sm">
                        Unit: {qty} {unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-800">
                      ₹{price?.toFixed(2)} X {quantityToBuy}
                    </p>
                    {partialQuantity > 0 && (
                      <p className="font-medium text-gray-800">
                        + ₹{((price / qty) * partialQuantity).toFixed(2)}{" "}
                        (Partial Qty)
                      </p>
                    )}
                    <p className="font-medium text-gray-800">
                      Total: ₹{totalItemPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Payment Info */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Payment Info</h2>
          <div className="mt-4 text-gray-600">
            <p>
              <span className="font-bold">Payment Status:</span>{" "}
              <span
                className={`${
                  order.isPaid ? "text-green-800" : "text-red-800"
                }`}
              >
                {order.isPaid ? "Paid" : "Not Paid"}
              </span>
            </p>
            {order.isPaid && (
              <p>
                <span className="font-bold">Paid At:</span>{" "}
                {formatDate(order.paidAt)}
              </p>
            )}
          </div>
        </section>

        {/* Delivery Info */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Delivery Info</h2>
          <div className="mt-4 text-gray-600">
            <p>
              <span className="font-bold">Delivery Status:</span>{" "}
              {order.orderStatus}
            </p>
            {order.orderStatus === "Delivered" && (
              <p>
                <span className="font-bold">Delivered At:</span>{" "}
                {formatDate(order.deliveredAt)}
              </p>
            )}
          </div>
        </section>

        {/* Summary */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700">Summary</h2>
          <div className="mt-4 text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{order.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charge:</span>
              <span>₹{order.deliveryCharge?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Handling Charge:</span>
              <span>₹{order.handlingCharge?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total:</span>
              <span>₹{order.totalAmount?.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center mt-6 border-t pt-4">
          <p className="text-gray-600 text-sm">
            Thank you for shopping with us! If you have any questions, contact
            us at{" "}
            <a href="mailto:support@example.com" className="text-blue-500">
              support@example.com
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
