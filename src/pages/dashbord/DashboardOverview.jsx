import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { toast } from "react-toastify";
import { requestNotificationPermission } from "@/firebase";
import Heading from "@/components/common/Heading";
import OrdersTable from "./OrdersTable";
import LargeCards from "./LargeCards";
import SmallCards from "./SmallCards";

export default function DashboardOverview() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useOutletContext();
  const axiosPrivate = useAxiosPrivate();
  useEffect(() => {
    // Request notification permission when the admin dashboard loads
    requestNotificationPermission();
  }, []);
  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axiosPrivate.get("/api/v1/orders");
        setOrders(response.data.data);
      } catch (error) {
        console.error("Error while fetching orders:", error);
        toast.error("Failed to fetch orders", {
          position: "top-right",
          autoClose: 3000,
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [axiosPrivate]);

  // Handle real-time order notifications
  useEffect(() => {
    if (socket) {
      const handleNewOrder = (notification) => {
        console.log("New order received in Dashboard Overview.");
        setOrders((prevOrders) => [notification.order, ...prevOrders]);
      };

      socket.on("receiveOrderNotification", handleNewOrder);

      return () => {
        socket.off("receiveOrderNotification", handleNewOrder);
      };
    }
  }, [socket]);

  return (
    <div>
      <Heading title="Dashboard Overview" />
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center h-24">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Dashboard content */}
      <div className={loading ? "opacity-50 pointer-events-none" : ""}>
        {/* Large Cards */}
        <LargeCards orders={orders} />
        
        {/* Small Cards */}
        <SmallCards orders={orders} />
        
        {/* Charts */}
        {/* <DashboardCharts sales={sales} orders={orders} /> */}
        
        {/* Recent Orders Table - Using context directly */}
        <OrdersTable />
      </div>
    </div>
  );
}