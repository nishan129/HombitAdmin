import React, { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/utility/formateDate"; // Assuming this utility exists and works
import { Eye, RefreshCw, CheckCircle, XCircle, CalendarCheck, Clock, UserCheck } from "lucide-react"; // Adjusted icons
import { toast } from "react-toastify";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"; // Assuming this hook exists
import { useNavigate, useOutletContext } from "react-router-dom";

// --- Configuration ---
const API_ENDPOINT = "/api/v1/orders"; // ADJUST IF YOUR ENDPOINT IS DIFFERENT
const SOCKET_EVENT_NAME = "receiveBookingNotification"; // ADJUST IF YOUR EVENT NAME IS DIFFERENT
const BOOKINGS_PER_PAGE = 10;
const BOOKING_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"]; // Adjust as needed
const PAYMENT_STATUSES = ["Paid", "Not Paid"];

// Status icon mapping component - Adjusted for potential booking statuses
const StatusIcon = ({ status }) => {
  switch(status) {
    case "Completed": return <CheckCircle size={16} className="text-green-500" />;
    case "Cancelled": return <XCircle size={16} className="text-red-500" />;
    case "Confirmed": return <UserCheck size={16} className="text-blue-500" />; // Example icon for Confirmed
    case "Pending": return <Clock size={16} className="text-yellow-500" />;
    // Add other statuses if needed
    default: return null;
  }
};

export default function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { socket } = useOutletContext(); // Assumes socket is provided via Outlet context
  const axiosPrivate = useAxiosPrivate();

  // Fetch bookings function (extracted for reuse)
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    console.log(`Workspaceing bookings from ${API_ENDPOINT}...`);
    try {
      const response = await axiosPrivate.get(API_ENDPOINT);
      // Sort bookings by creation date descending (newest first) for better UX
      const sortedBookings = response.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sortedBookings);
      console.log("Bookings fetched successfully:", sortedBookings.length);
    } catch (error) {
      console.error("Error while fetching bookings:", error);
      toast.error("Failed to fetch bookings.", {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, [axiosPrivate]);

  // Initial fetch of bookings
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Handle real-time booking notifications
  useEffect(() => {
    if (socket) {
      const handleNewBooking = (notification) => {
        console.log("New booking notification received in BookingsTable:", notification);
        // Ensure the notification structure is correct and contains the booking data
        const newBooking = notification.booking || notification; // Adjust based on your notification structure

        if (newBooking && newBooking._id) {
            toast.info("New booking received!", {
              position: "top-right",
              autoClose: 3000,
            });
            // Add to the start of the list and potentially remove duplicates if any
            setBookings((prevBookings) => [
              newBooking,
              ...prevBookings.filter(b => b._id !== newBooking._id)
            ]);
        } else {
             console.warn("Received notification does not contain valid booking data.");
        }
      };

      console.log(`Listening for socket event: ${SOCKET_EVENT_NAME}`);
      socket.on(SOCKET_EVENT_NAME, handleNewBooking);

      return () => {
        console.log(`Removing socket event listener: ${SOCKET_EVENT_NAME}`);
        socket.off(SOCKET_EVENT_NAME, handleNewBooking);
      };
    } else {
        console.log("Socket not available in BookingsTable.");
    }
  }, [socket]);

  // Pagination logic
  const indexOfLastBooking = currentPage * BOOKINGS_PER_PAGE;
  const indexOfFirstBooking = indexOfLastBooking - BOOKINGS_PER_PAGE;
  const currentBookings = bookings.slice(indexOfFirstBooking, indexOfLastBooking);
  const totalPages = Math.ceil(bookings.length / BOOKINGS_PER_PAGE);

  // Handle select all checkbox change
  useEffect(() => {
    const allCurrentIds = currentBookings.map(booking => booking._id);
    const allSelectedOnPage = allCurrentIds.length > 0 && allCurrentIds.every(id => selectedBookings.includes(id));
    setSelectAll(allSelectedOnPage);
  }, [selectedBookings, currentBookings]);


  const handleSelectAll = () => {
    const currentIds = currentBookings.map(booking => booking._id);
    if (selectAll) {
      // Deselect all on the current page
      setSelectedBookings(prev => prev.filter(id => !currentIds.includes(id)));
    } else {
      // Select all on the current page, avoiding duplicates
      setSelectedBookings(prev => [...new Set([...prev, ...currentIds])]);
    }
    setSelectAll(!selectAll); // Toggle state immediately for responsiveness
  };

  // Handle individual booking selection
  const handleSelectBooking = (bookingId) => {
    setSelectedBookings(prev =>
      prev.includes(bookingId)
        ? prev.filter(id => id !== bookingId)
        : [...prev, bookingId]
    );
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
     if (pageNumber >= 1 && pageNumber <= totalPages) {
       setCurrentPage(pageNumber);
       // Deselect the 'select all' checkbox when changing pages
       setSelectAll(false);
     }
  };

  if (loading && bookings.length === 0) { // Show loader only on initial load
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Recent Bookings</h1>
        <div className="flex space-x-2">
           {/* Add actions for selected bookings if needed */}
           {selectedBookings.length > 0 && (
             <span className="text-sm text-gray-500 self-center">
                {selectedBookings.length} selected
             </span>
             // Add bulk action buttons here (e.g., change status, delete)
           )}
          <button
            className={`px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={fetchBookings}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''}/> Refresh
          </button>
        </div>
      </div>

      {bookings.length === 0 && !loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <CalendarCheck size={48} /> {/* Changed icon */}
          <p className="mt-4 text-lg">No bookings found</p>
          <p className="text-sm">Check back later or create a new booking.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[800px]"> {/* Min width for horizontal scroll */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left w-12"> {/* Fixed width for checkbox */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        disabled={currentBookings.length === 0}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                        aria-label="Select all bookings on this page"
                      />
                    </div>
                  </th>
                  {/* Adjusted Headers */}
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {currentBookings.map((booking) => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    isSelected={selectedBookings.includes(booking._id)}
                    onSelectBooking={handleSelectBooking}
                    apiEndpoint={API_ENDPOINT} // Pass endpoint base
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing {bookings.length > 0 ? indexOfFirstBooking + 1 : 0} to {Math.min(indexOfLastBooking, bookings.length)} of {bookings.length} bookings
            </div>
            {totalPages > 1 && (
                <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Booking row component
const BookingRow = ({ booking, isSelected, onSelectBooking, apiEndpoint }) => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [bookingStatus, setBookingStatus] = useState(booking.bookingStatus);
  const [isPaid, setIsPaid] = useState(booking.isPaid ? "Paid" : "Not Paid");
  const [loading, setLoading] = useState({ bookingStatus: false, paymentStatus: false });

  // Update local state if booking prop changes (e.g., due to real-time updates)
  useEffect(() => {
      setBookingStatus(booking.bookingStatus);
      setIsPaid(booking.isPaid ? "Paid" : "Not Paid");
  }, [booking.bookingStatus, booking.isPaid]);

  // Handle booking status update
  const handleBookingStatusChange = async (e) => {
    const newStatus = e.target.value;
    const originalStatus = bookingStatus; // Store original status for revert
    setBookingStatus(newStatus);
    setLoading((prev) => ({ ...prev, bookingStatus: true }));

    try {
      console.log(`Updating booking ${order._id} status to ${newStatus}`);
      await axiosPrivate.patch(`${apiEndpoint}/${order._id}/order-status`, { status: newStatus });
      toast.success("Booking status updated successfully!", {
        position: "top-right", autoClose: 3000,
      });
      // Optionally: refetch bookings list or update parent state if needed
    } catch (error) {
      console.error("Failed to update booking status:", error);
      toast.error("Failed to update booking status.", {
        position: "top-right", autoClose: 3000,
      });
      setBookingStatus(originalStatus); // Revert on failure
    } finally {
      setLoading((prev) => ({ ...prev, bookingStatus: false }));
    }
  };

  // Handle payment status update
  const handlePaymentStatusChange = async (e) => {
    const newStatus = e.target.value;
    const originalStatus = isPaid; // Store original status for revert
    setIsPaid(newStatus);
    setLoading((prev) => ({ ...prev, paymentStatus: true }));

    try {
      console.log(`Updating booking ${order._id} payment status to ${newStatus}`);
      await axiosPrivate.patch(`${apiEndpoint}/${order._id}/payment-status`, {
        isPaid: newStatus === "Paid",
      });
      toast.success("Payment status updated successfully!", {
        position: "top-right", autoClose: 3000,
      });
       // Optionally: refetch bookings list or update parent state if needed
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast.error("Failed to update payment status.", {
        position: "top-right", autoClose: 3000,
      });
      setIsPaid(originalStatus); // Revert on failure
    } finally {
      setLoading((prev) => ({ ...prev, paymentStatus: false }));
    }
  };

  // Get booking status styles - Adjusted for potential booking statuses
  const getBookingStatusStyles = (status) => {
    const styles = {
      Cancelled: "bg-red-50 text-red-700 border-red-200",
      Completed: "bg-green-50 text-green-700 border-green-200",
      Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      // Add other statuses if needed
    };
    return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  // Get payment status styles (Remains the same)
  const getPaymentStatusStyles = (status) =>
    status === "Paid"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-red-50 text-red-700 border-red-200";

  // --- Safely access potentially nested data ---
  const customerName = booking.userFullName || "N/A";
  const customerPhone = booking.userPhone || "N/A";
  // Assuming serviceAddress might be an object with a 'city' property or just a string
  const location = typeof booking.serviceAddress === 'object' ? booking.serviceAddress?.city : booking.serviceAddress || "N/A";
  const serviceDateFormatted = booking.createdAt ? formatDate(booking.createdAt) : "N/A";
  const timeSlot = booking.serviceTimeSlot || "N/A";
  const amountFormatted = `₹${booking.totalAmount != null ? booking.totalAmount.toFixed(2) : '0.00'}`; // Using != null to catch undefined too

  return (
    <tr className={`hover:bg-gray-50 transition-colors duration-150 ${isSelected ? "bg-blue-50" : ""}`}>
      <td className="p-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelectBooking(booking._id)}
            aria-labelledby={`booking-customer-${booking._id}`} // For accessibility
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </div>
      </td>
      <td className="p-3 whitespace-nowrap">
        <div id={`booking-customer-${booking._id}`} className="text-sm font-medium text-gray-900">{customerName}</div>
        {/* Optionally display email or other identifier if available */}
        {/* <div className="text-xs text-gray-500">{booking.userEmail}</div> */}
      </td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{customerPhone}</td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{location}</td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{serviceDateFormatted}</td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{timeSlot}</td>
      <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-900">{amountFormatted}</td>
      <td className="p-3 whitespace-nowrap">
        {/* Booking Status Dropdown */}
        <div className="relative">
          <select
            value={bookingStatus}
            onChange={handleBookingStatusChange}
            className={`appearance-none w-full pl-7 pr-6 py-1 text-xs font-medium rounded-full border focus:outline-none focus:ring-1 focus:ring-blue-500 ${getBookingStatusStyles(bookingStatus)} ${loading.bookingStatus ? 'opacity-70 cursor-wait' : ''}`}
            disabled={loading.bookingStatus}
            aria-label={`Booking status for ${customerName}`}
          >
            {BOOKING_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
             {loading.bookingStatus ? <div className="animate-spin rounded-full h-3 w-3 border-t-1 border-b-1 border-gray-500"></div> : <StatusIcon status={bookingStatus} />}
          </div>
        </div>
      </td>
      <td className="p-3 whitespace-nowrap">
        {/* Payment Status Dropdown */}
         <div className="relative">
            <select
                value={isPaid}
                onChange={handlePaymentStatusChange}
                className={`appearance-none w-full px-3 py-1 text-xs font-medium rounded-full border focus:outline-none focus:ring-1 focus:ring-blue-500 ${getPaymentStatusStyles(isPaid)} ${loading.paymentStatus ? 'opacity-70 cursor-wait' : ''}`}
                disabled={loading.paymentStatus}
                aria-label={`Payment status for ${customerName}`}
            >
                {PAYMENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                    {status}
                </option>
                ))}
            </select>
             {loading.paymentStatus && (
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-t-1 border-b-1 border-gray-500"></div>
                </div>
             )}
        </div>
      </td>
      <td className="p-3 whitespace-nowrap text-center text-sm font-medium">
        <button
          onClick={() => navigate(`/dashboard/orders/${booking._id}`)} // Adjusted navigation link
          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
          title="View Booking Details"
        >
          <Eye size={18} />
        </button>
        {/* Add other action buttons like Edit or Delete if needed */}
      </td>
    </tr>
  );
};

// Pagination component (Slightly improved accessibility and edge cases)
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Limit visible page numbers for large totalPages
  const getVisiblePageNumbers = () => {
     if (totalPages <= 7) { // Show all if 7 or less
       return Array.from({ length: totalPages }, (_, i) => i + 1);
     }

     const visiblePages = [];
     visiblePages.push(1); // Always show first page

     const startEllipsis = currentPage > 4;
     const endEllipsis = currentPage < totalPages - 3;

     if (startEllipsis) {
       visiblePages.push('...');
     }

     const rangeStart = Math.max(2, currentPage - (startEllipsis && endEllipsis ? 1 : 2));
     const rangeEnd = Math.min(totalPages - 1, currentPage + (startEllipsis && endEllipsis ? 1 : 2));

     for (let i = rangeStart; i <= rangeEnd; i++) {
        visiblePages.push(i);
     }

     if (endEllipsis) {
       visiblePages.push('...');
     }

     visiblePages.push(totalPages); // Always show last page
     return visiblePages;
  };

  const pageNumbersToRender = getVisiblePageNumbers();

  return (
    <nav aria-label="Booking Pagination">
      <ul className="flex items-center -space-x-px h-8 text-sm">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`flex items-center justify-center px-3 h-8 ms-0 leading-tight text-gray-500 bg-white border border-e-0 border-gray-300 rounded-s-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-disabled={currentPage === 1}
          >
            <span className="sr-only">Previous</span>
            <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 1 1 5l4 4"/>
            </svg>
          </button>
        </li>

        {pageNumbersToRender.map((number, index) => (
          <li key={index}>
            {number === '...' ? (
              <span className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300">...</span>
            ) : (
              <button
                onClick={() => onPageChange(number)}
                className={`flex items-center justify-center px-3 h-8 leading-tight border border-gray-300 ${
                  currentPage === number
                    ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700'
                    : 'text-gray-500 bg-white hover:bg-gray-100 hover:text-gray-700'
                }`}
                aria-current={currentPage === number ? 'page' : undefined}
              >
                {number}
              </button>
            )}
          </li>
        ))}

        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-disabled={currentPage === totalPages}
          >
             <span className="sr-only">Next</span>
             <svg className="w-2.5 h-2.5 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
               <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
             </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

