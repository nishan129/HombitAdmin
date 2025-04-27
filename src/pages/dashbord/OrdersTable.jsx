import React, { useState, useEffect } from "react";
import { formatDate } from "@/utility/formateDate";
import { Eye, RefreshCw, CheckCircle, XCircle, Truck, Package, Clock } from "lucide-react";
import { toast } from "react-toastify";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useNavigate, useOutletContext } from "react-router-dom";

// Status icon mapping component
const StatusIcon = ({ status }) => {
  switch(status) {
    case "Delivered": return <CheckCircle size={16} className="text-green-500" />;
    case "Cancelled": return <XCircle size={16} className="text-red-500" />;
    case "Shipped": return <Truck size={16} className="text-purple-500" />;
    case "Processing": return <RefreshCw size={16} className="text-blue-500" />;
    case "Pending": return <Clock size={16} className="text-yellow-500" />;
    case "Returned": return <Package size={16} className="text-orange-500" />;
    default: return null;
  }
};

export default function OrdersTable() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { socket } = useOutletContext();
  const axiosPrivate = useAxiosPrivate();
  const ordersPerPage = 10;

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
        console.log("New order received in OrderTable.");
        toast.info("New order received!", {
          position: "top-right",
          autoClose: 3000,
        });
        setOrders((prevOrders) => [notification.order, ...prevOrders]);
      };

      socket.on("receiveOrderNotification", handleNewOrder);

      return () => {
        socket.off("receiveOrderNotification", handleNewOrder);
      };
    }
  }, [socket]);

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map(order => order._id));
    }
    setSelectAll(!selectAll);
  };

  // Handle individual order selection
  const handleSelectOrder = (orderId) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Recent Orders</h1>
        <div className="flex space-x-2">
          <button 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2"
            onClick={() => {/* Add refresh logic */}}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <Package size={48} />
          <p className="mt-4 text-lg">No orders found</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentOrders.map((order) => (
                  <OrderRow 
                    key={order._id} 
                    order={order} 
                    isSelected={selectedOrders.includes(order._id)}
                    onSelectOrder={handleSelectOrder}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
            </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        </>
      )}
    </div>
  );
}

// Order row component
const OrderRow = ({ order, isSelected, onSelectOrder }) => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [isPaid, setIsPaid] = useState(order.isPaid ? "Paid" : "Not Paid");
  const [loading, setLoading] = useState({ orderStatus: false, paymentStatus: false });

  // Handle order status update
  const handleOrderStatusChange = async (e) => {
    const newStatus = e.target.value;
    setOrderStatus(newStatus);
    setLoading((prev) => ({ ...prev, orderStatus: true }));

    try {
      await axiosPrivate.patch(`/api/v1/orders/${order._id}/order-status`, { status: newStatus });
      toast.success("Order status updated successfully!", {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to update order status.", {
        position: "top-right",
        autoClose: 3000,
      });
      setOrderStatus(order.orderStatus); // Revert on failure
    } finally {
      setLoading((prev) => ({ ...prev, orderStatus: false }));
    }
  };

  // Handle payment status update
  const handlePaymentStatusChange = async (e) => {
    const newStatus = e.target.value;
    setIsPaid(newStatus);
    setLoading((prev) => ({ ...prev, paymentStatus: true }));

    try {
      await axiosPrivate.patch(`/api/v1/orders/${order._id}/payment-status`, {
        isPaid: newStatus === "Paid",
      });
      toast.success("Payment status updated successfully!", {
        position: "top-right", 
        autoClose: 3000,
      });
    } catch (error) {
      toast.error("Failed to update payment status.", {
        position: "top-right",
        autoClose: 3000,
      });
      setIsPaid(order.isPaid ? "Paid" : "Not Paid"); // Revert on failure
    } finally {
      setLoading((prev) => ({ ...prev, paymentStatus: false }));
    }
  };

  // Get status styles
  const getOrderStatusStyles = (status) => {
    const styles = {
      Cancelled: "bg-red-50 text-red-700 border-red-200",
      Delivered: "bg-green-50 text-green-700 border-green-200",
      Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Processing: "bg-blue-50 text-blue-700 border-blue-200",
      Shipped: "bg-purple-50 text-purple-700 border-purple-200",
      Returned: "bg-orange-50 text-orange-700 border-orange-200",
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // Get payment status styles
  const getPaymentStatusStyles = (status) => 
    status === "Paid" 
      ? "bg-green-50 text-green-700 border-green-200" 
      : "bg-red-50 text-red-700 border-red-200";

  return (
    <tr className={`hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}>
      <td className="p-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectOrder(order._id)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </td>
      <td className="p-3 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{order.userFullName || "Customer"}</div>
        {order.userFullName && <div className="text-xs text-gray-500">{order.userMo}</div>}
      </td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{order.userMo}</td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">
        {order.shippingAddress?.city || "N/A"}
      </td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
      <td className="p-3 whitespace-nowrap">
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {order.orderItems?.length || 0} items
        </span>
      </td>
      <td className="p-3 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">₹{order.amount.toFixed(2)}</div>
      </td>
      <td className="p-3 whitespace-nowrap">
        <div className="relative">
          <select
            value={orderStatus}
            onChange={handleOrderStatusChange}
            className={`appearance-none pl-7 pr-6 py-1 text-xs font-medium rounded-full border ${getOrderStatusStyles(orderStatus)}`}
            disabled={loading.orderStatus}
          >
            {["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Returned"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
            <StatusIcon status={orderStatus} />
          </div>
        </div>
      </td>
      <td className="p-3 whitespace-nowrap">
        <select
          value={isPaid}
          onChange={handlePaymentStatusChange}
          className={`appearance-none px-3 py-1 text-xs font-medium rounded-full border ${getPaymentStatusStyles(isPaid)}`}
          disabled={loading.paymentStatus}
        >
          {["Paid", "Not Paid"].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </td>
      <td className="p-3 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => navigate(`/dashboard/orders/${order._id}`)}
          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors duration-200"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
};

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  
  // Generate page numbers array
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  // Limit visible page numbers
  const getVisiblePageNumbers = () => {
    if (totalPages <= 5) return pageNumbers;
    
    if (currentPage <= 3) {
      return [...pageNumbers.slice(0, 5), '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      return [1, '...', ...pageNumbers.slice(totalPages - 5)];
    } else {
      return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Previous
      </button>
      
      {getVisiblePageNumbers().map((number, index) => (
        number === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-1">...</span>
        ) : (
          <button
            key={number}
            onClick={() => onPageChange(number)}
            className={`px-3 py-1 rounded-md ${
              currentPage === number
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {number}
          </button>
        )
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        Next
      </button>
    </div>
  );
};