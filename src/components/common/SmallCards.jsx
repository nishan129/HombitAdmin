import React from "react";
import SmallCard from "./SmallCard";
import { ShoppingCart, CheckCheck, Truck, Loader2 } from "lucide-react";

export default function SmallCards({ orders }) {
  const orderStatus = {
    pending: "PENDING",
    processing: "PROCESSING",
    shipping: "SHIPPED",
    delivering: "DELIVERED",
    cancelling: "CANCELED",
  };

  const data = [
    {
      title: "Total Orders",
      number: 23,
      iconBg: "bg-green-600",
      icon: ShoppingCart,
    },
    {
      title: "Orders Pending",
      number: 44,
      iconBg: "bg-blue-600",
      icon: Loader2,
    },
    {
      title: "Orders Processing",
      number: 76,
      iconBg: "bg-orange-600",
      icon: Truck,
    },
    {
      title: "Orders Delivered",
      number: 990,
      iconBg: "bg-purple-600",
      icon: CheckCheck,
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
      {data.map((data, i) => {
        return <SmallCard key={i} data={data} />;
      })}
    </div>
  );
}
