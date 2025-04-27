import React, { useState, useEffect, useMemo } from "react";
import { 
  ShoppingCart, Clock, RefreshCw, Truck, 
  CheckCircle, AlertCircle 
} from "lucide-react";
import SmallCard from "@/components/common/SmallCard";

// Utility functions for order analysis
const calculateOrderTrends = (currentOrders, previousOrders) => {
  if (!previousOrders?.length) return {};
  
  const current = {
    total: currentOrders.length,
    pending: currentOrders.filter(o => o.orderStatus?.toLowerCase() === "pending").length,
    processing: currentOrders.filter(o => o.orderStatus?.toLowerCase() === "processing").length,
    shipped: currentOrders.filter(o => o.orderStatus?.toLowerCase() === "shipped").length,
    delivered: currentOrders.filter(o => o.orderStatus?.toLowerCase() === "delivered").length,
  };
  
  const previous = {
    total: previousOrders.length,
    pending: previousOrders.filter(o => o.orderStatus?.toLowerCase() === "pending").length,
    processing: previousOrders.filter(o => o.orderStatus?.toLowerCase() === "processing").length,
    shipped: previousOrders.filter(o => o.orderStatus?.toLowerCase() === "shipped").length,
    delivered: previousOrders.filter(o => o.orderStatus?.toLowerCase() === "delivered").length,
  };
  
  // Calculate percentage changes
  const calculatePercentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  };
  
  return {
    total: calculatePercentChange(current.total, previous.total),
    pending: calculatePercentChange(current.pending, previous.pending),
    processing: calculatePercentChange(current.processing, previous.processing),
    shipped: calculatePercentChange(current.shipped, previous.shipped),
    delivered: calculatePercentChange(current.delivered, previous.delivered),
  };
};

// Hook for real-time order tracking
const useOrderTracking = (initialOrders = []) => {
  const [orders, setOrders] = useState(initialOrders);
  const [previousOrders, setPreviousOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Function to fetch latest orders
  const fetchLatestOrders = async () => {
    setLoading(true);
    try {
      // Simulating API call - replace with your actual API call
      // const response = await fetch('/api/orders');
      // const data = await response.json();
      
      // For demo purposes, we're just using the current orders
      setPreviousOrders(orders);
      
      // In a real app, you would set orders with data from your API
      // setOrders(data);
      
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch order updates");
      setLoading(false);
    }
  };
  
  // Update orders state when initialOrders prop changes
  useEffect(() => {
    if (initialOrders.length > 0) {
      setOrders(initialOrders);
    }
  }, [initialOrders]);
  
  return {
    orders,
    previousOrders,
    loading,
    error,
    updateOrders: setOrders,
    refreshOrders: fetchLatestOrders
  };
};

// SmallCards component with real-time updates and trend analysis
const SmallCards = ({ orders = [], refreshInterval = 60000 }) => {
  const { 
    orders: currentOrders, 
    previousOrders,
    loading,
    error,
    refreshOrders
  } = useOrderTracking(orders);
  
  // Set up automatic refresh interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      refreshOrders();
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval, refreshOrders]);
  
  // Calculate order statistics with memoization for performance
  const orderStats = useMemo(() => {
    // Initial counters
    const stats = {
      total: currentOrders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
    };
    
    // Count orders by status
    currentOrders.forEach(order => {
      const status = order.orderStatus?.toLowerCase() || "";
      
      if (status === "pending") {
        stats.pending++;
      } else if (status === "processing") {
        stats.processing++;
      } else if (status === "shipped") {
        stats.shipped++;
      } else if (status === "delivered") {
        stats.delivered++;
      }
    });
    
    return stats;
  }, [currentOrders]);
  
  // Calculate trend percentages
  const trends = useMemo(() => {
    return calculateOrderTrends(currentOrders, previousOrders);
  }, [currentOrders, previousOrders]);
  
  // Define card data based on calculated stats and trends
  const cardData = [
    {
      title: "Total Booking",
      number: orderStats.total,
      iconBg: "bg-blue-600",
      icon: ShoppingCart,
      percentChange: trends.total,
      isLoading: loading
    },
    {
      title: "Booking Pending",
      number: orderStats.pending,
      iconBg: "bg-amber-500",
      icon: Clock,
      percentChange: trends.pending,
      isLoading: loading
    },
    {
      title: "Booking Processing",
      number: orderStats.processing,
      iconBg: "bg-purple-600",
      icon: RefreshCw,
      percentChange: trends.processing,
      isLoading: loading
    },
    {
      title: "Service Start",
      number: orderStats.shipped,
      iconBg: "bg-indigo-600",
      icon: Truck,
      percentChange: trends.shipped,
      isLoading: loading
    },
    {
      title: "Service Completed",
      number: orderStats.delivered,
      iconBg: "bg-emerald-600",
      icon: CheckCircle,
      percentChange: trends.delivered,
      isLoading: loading
    },
  ];

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center mb-4">
          <AlertCircle size={18} className="mr-2" />
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 py-6">
        {cardData.map((data, i) => (
          <SmallCard key={i} data={data} />
        ))}
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={refreshOrders}
          disabled={loading}
          className="flex items-center text-sm text-gray-600 bg-white px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
    </div>
  );
};

export { SmallCards, useOrderTracking, calculateOrderTrends };
export default SmallCards;