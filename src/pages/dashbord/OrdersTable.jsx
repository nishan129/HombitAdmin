import React, { useState, useEffect, useCallback } from "react";
import { formatDate } from "@/utility/formateDate"; // Assuming this utility exists and works
import { Eye, RefreshCw, CheckCircle, XCircle, CalendarCheck, Clock, UserCheck, UserPlus } from "lucide-react"; // Adjusted icons
import { toast } from "react-toastify";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"; // Assuming this hook exists
import { useNavigate, useOutletContext } from "react-router-dom";

// --- Configuration ---
const API_ORDERS_ENDPOINT = "/api/v1/orders"; // Base Order endpoint
const API_MAIDS_ENDPOINT = "/api/v1/maids"; // Maid endpoint
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

// #############################################################
// #                 BookingsTable Component                   #
// #       (No changes needed here from the previous version)  #
// #############################################################
export default function BookingsTable() {
  const [bookings, setBookings] = useState([]);
  const [availableMaids, setAvailableMaids] = useState([]); // State for available maids
  const [loading, setLoading] = useState({ bookings: true, maids: true }); // Combined loading state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBookings, setSelectedBookings] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { socket } = useOutletContext(); // Assumes socket is provided via Outlet context
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate(); // Added useNavigate

  // Fetch bookings function
  const fetchBookings = useCallback(async () => {
    setLoading(prev => ({ ...prev, bookings: true }));
    console.log(`Fetching bookings from ${API_ORDERS_ENDPOINT}...`);
    try {
      const response = await axiosPrivate.get(API_ORDERS_ENDPOINT);
      // Use response.data.data based on ApiResponse structure
      const bookingData = response.data?.data || [];
      const sortedBookings = bookingData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBookings(sortedBookings);
      console.log("Bookings fetched successfully:", sortedBookings.length);
    } catch (error) {
      console.error("Error while fetching bookings:", error);
      toast.error(`Failed to fetch bookings: ${error?.response?.data?.error || error.message}`, { position: "top-right", autoClose: 3000 });
    } finally {
      setLoading(prev => ({ ...prev, bookings: false }));
    }
  }, [axiosPrivate]);

  // Fetch available maids function
  const fetchAvailableMaids = useCallback(async () => {
    setLoading(prev => ({ ...prev, maids: true }));
    console.log(`Fetching maids from ${API_MAIDS_ENDPOINT}...`);
    try {
      const response = await axiosPrivate.get(API_MAIDS_ENDPOINT);
      // Assuming maid endpoint returns array directly or in .data
      const maidsData = response.data?.data || response.data || [];
      const filteredMaids = maidsData.filter(maid => !maid.working);
      setAvailableMaids(filteredMaids);
      console.log("Available maids fetched:", filteredMaids.length);
    } catch (error) {
      console.error("Error while fetching maids:", error);
      // Optional: show a toast
    } finally {
      setLoading(prev => ({ ...prev, maids: false }));
    }
  }, [axiosPrivate]);

  // Initial fetch
  useEffect(() => {
    fetchBookings();
    fetchAvailableMaids();
  }, [fetchBookings, fetchAvailableMaids]);

  // Function to update a single booking in the state
  const updateBookingInState = useCallback((updatedBooking) => {
      setBookings(prevBookings =>
          prevBookings.map(b => (b._id === updatedBooking._id ? updatedBooking : b))
      );
      // Also potentially refresh available maids if status changed affects it
      // (e.g., if a maid is freed up when order is completed/cancelled)
      if (['Completed', 'Cancelled'].includes(updatedBooking.bookingStatus)) {
          fetchAvailableMaids();
      }
  }, [fetchAvailableMaids]); // Add dependency

  // Handle real-time booking notifications
  useEffect(() => {
     if (socket) {
       const handleNewBooking = (notification) => {
         console.log("New booking notification received in BookingsTable:", notification);
         // Adjust based on your actual notification payload structure
         const receivedBooking = notification.booking || notification.order || notification;

         if (receivedBooking && receivedBooking._id) {
             toast.info("New booking received/updated!", { position: "top-right", autoClose: 3000 });
             // Add or update booking in state
             setBookings((prevBookings) => {
                const existingIndex = prevBookings.findIndex(b => b._id === receivedBooking._id);
                if (existingIndex > -1) {
                    // Update existing booking
                    const updatedList = [...prevBookings];
                    // Merge new data into existing booking to preserve potential frontend state
                    updatedList[existingIndex] = { ...updatedList[existingIndex], ...receivedBooking };
                    return updatedList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Re-sort
                } else {
                    // Add new booking to the start
                    return [receivedBooking, ...prevBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Add and sort
                }
             });
             // Potentially refresh maids if the update involved assignment/completion
             if (receivedBooking.assignedMaid || ['Completed', 'Cancelled'].includes(receivedBooking.bookingStatus)) {
                 fetchAvailableMaids();
             }
         } else {
            console.warn("Received notification does not contain valid booking data:", receivedBooking);
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
  }, [socket, updateBookingInState, fetchAvailableMaids]); // Add dependencies


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
       setSelectedBookings(prev => prev.filter(id => !currentIds.includes(id)));
     } else {
       setSelectedBookings(prev => [...new Set([...prev, ...currentIds])]);
     }
     setSelectAll(!selectAll);
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
         setSelectAll(false); // Deselect all when changing page
       }
   };

  const isInitialLoading = loading.bookings && bookings.length === 0;

  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Recent Bookings</h1>
        <div className="flex space-x-2">
          {selectedBookings.length > 0 && (
             <span className="text-sm text-gray-500 self-center">
               {selectedBookings.length} selected
             </span>
          )}
          <button
            className={`px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center gap-2 ${loading.bookings || loading.maids ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => { fetchBookings(); fetchAvailableMaids(); }}
            disabled={loading.bookings || loading.maids}
            title="Refresh bookings and available maids"
          >
            <RefreshCw size={16} className={loading.bookings || loading.maids ? 'animate-spin' : ''}/> Refresh
          </button>
        </div>
      </div>

      {/* Table or No Bookings Message */}
      {bookings.length === 0 && !loading.bookings ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
           <CalendarCheck size={48} />
           <p className="mt-4 text-lg">No bookings found</p>
           <p className="text-sm">Check back later or create a new booking.</p>
         </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full min-w-[1000px]"> {/* Adjust min-width as needed */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      disabled={currentBookings.length === 0}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                      aria-label="Select all bookings on this page"
                    />
                  </th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Slot</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Maid</th>
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
                    availableMaids={availableMaids}
                    maidsLoading={loading.maids}
                    apiEndpointBase={API_ORDERS_ENDPOINT} // Pass base endpoint
                    onBookingUpdate={updateBookingInState}
                    onMaidAssigned={fetchAvailableMaids} // Callback to refetch maids
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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


// #############################################################
// #                  BookingRow Component                     #
// #         (Updated to match backend API endpoints)          #
// #############################################################
const BookingRow = ({
    booking,
    isSelected,
    onSelectBooking,
    availableMaids,
    maidsLoading,
    apiEndpointBase, // Renamed prop for clarity
    onBookingUpdate,
    onMaidAssigned
}) => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // Local state primarily for managing inputs and loading states within the row
  const [selectedMaidId, setSelectedMaidId] = useState("");
  const [loading, setLoading] = useState({
      bookingStatus: false,
      paymentStatus: false,
      assigningMaid: false
  });

  // Derive display values directly from the booking prop
  const currentBooking = booking; // Use prop directly for display consistency
  const displayBookingStatus = currentBooking.bookingStatus || 'Unknown';
  const displayPaymentStatus = currentBooking.isPaid ? "Paid" : "Not Paid";

  // --- Handler for Booking Status Change ---
  const handleBookingStatusChange = async (e) => {
    const newStatus = e.target.value;
    const originalStatus = displayBookingStatus;
    setLoading((prev) => ({ ...prev, bookingStatus: true }));

    try {
      console.log(`Updating booking ${currentBooking._id} status to ${newStatus}`);
      // *** Use the specific backend endpoint ***
      const response = await axiosPrivate.patch(
          `${apiEndpointBase}/${currentBooking._id}/order-status`, // Correct endpoint
          { status: newStatus } // Correct payload key
      );
      toast.success("Booking status updated successfully!");
      // Update parent state with the data from the API response
      if(response.data?.data) {
          onBookingUpdate(response.data.data);
      } else {
          // Fallback if API doesn't return data (less ideal)
          onBookingUpdate({...currentBooking, bookingStatus: newStatus });
      }
    } catch (error) {
      console.error("Failed to update booking status:", error);
      toast.error(`Update failed: ${error?.response?.data?.error || error.message}`);
      // No UI revert needed as we read directly from prop which will be updated by parent on error eventually
    } finally {
      setLoading((prev) => ({ ...prev, bookingStatus: false }));
    }
  };

  // --- Handler for Payment Status Change ---
  const handlePaymentStatusChange = async (e) => {
      const newPaymentDisplayStatus = e.target.value; // "Paid" or "Not Paid"
      const newIsPaidValue = newPaymentDisplayStatus === "Paid";
      const originalIsPaidValue = currentBooking.isPaid;
      setLoading((prev) => ({ ...prev, paymentStatus: true }));

      try {
          console.log(`Updating booking ${currentBooking._id} payment status to ${newIsPaidValue}`);
          // *** Use the specific backend endpoint ***
          const response = await axiosPrivate.patch(
              `${apiEndpointBase}/${currentBooking._id}/payment-status`, // Correct endpoint
              { isPaid: newIsPaidValue } // Correct payload
          );
          toast.success("Payment status updated successfully!");
          // Update parent state with the data from the API response
          if(response.data?.data) {
              onBookingUpdate(response.data.data);
          } else {
              // Fallback if API doesn't return data
              onBookingUpdate({...currentBooking, isPaid: newIsPaidValue });
          }
      } catch (error) {
          console.error("Failed to update payment status:", error);
          toast.error(`Update failed: ${error?.response?.data?.error || error.message}`);
          // No UI revert needed
      } finally {
          setLoading((prev) => ({ ...prev, paymentStatus: false }));
      }
  };


  // --- Handler for Assigning Maid ---
  // --- Maid Assignment Logic ---
const handleAssignMaid = async () => {
  if (!selectedMaidId) {
      toast.warn("Please select a maid to assign.");
      return;
  }
  setLoading(prev => ({ ...prev, assigningMaid: true }));

  try {
      console.log(`Assigning maid ${selectedMaidId} to order ${currentBooking._id}`);

      // *** EXPECTATION ***
      // This API endpoint ('/api/v1/maids/assign-order') is expected to:
      // 1. Associate the maid with the order in the database.
      // 2. Update the assigned maid's status (e.g., set 'working: true') in the database.
      const response = await axiosPrivate.post('/api/v1/maids/assign-order', {
          maidId: selectedMaidId,
          orderId: currentBooking._id
      });

      toast.success(response.data?.message || "Maid assigned successfully!");

      // Get the potentially updated booking from the API response
      // (includes assigned maid details and potentially 'Confirmed' status)
      const updatedBookingData = response.data?.order || {
          ...currentBooking,
          bookingStatus: "Confirmed", // Assume status changes if API doesn't confirm
          assignedMaid: availableMaids.find(m => m._id === selectedMaidId) || { _id: selectedMaidId, fullName: 'Assigned' }
      };

      // Update the parent component's state for the booking
      // This will re-render the row with the assigned maid's name
      onBookingUpdate(updatedBookingData);

      // Update local state as well (might be handled by useEffect listening to props)
      setCurrentBooking(updatedBookingData);
      setSelectedMaidId(""); // Reset dropdown

      // Refresh the list of available maids in the parent component.
      // This calls fetchAvailableMaids, which filters based on 'working' status.
      // If the backend API correctly set the maid to 'working: true',
      // that maid will be excluded from the refreshed availableMaids list.
      if (onMaidAssigned) {
          onMaidAssigned();
      }

  } catch (error) {
      console.error("Failed to assign maid:", error);
      toast.error(`Failed to assign maid: ${error?.response?.data?.error || error.message}`);
      // No UI revert needed for maid selection itself, but the booking wasn't updated.
      // The optimistic booking update didn't happen here, so no revert needed for that either.
  } finally {
      setLoading(prev => ({ ...prev, assigningMaid: false }));
  }
};


  // Get status styles
  const getBookingStatusStyles = (status) => {
      const styles = {
          Cancelled: "bg-red-50 text-red-700 border-red-200",
          Completed: "bg-green-50 text-green-700 border-green-200",
          Pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
          Confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      };
      return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  const getPaymentStatusStyles = (status) =>
      status === "Paid"
        ? "bg-green-50 text-green-700 border-green-200"
        : "bg-red-50 text-red-700 border-red-200";

  // Safely access data
  const customerName = currentBooking.userFullName || "N/A";
  const customerPhone = currentBooking.userPhone || "N/A";
  const location = typeof currentBooking.serviceAddress === 'object' ? currentBooking.serviceAddress?.city : currentBooking.serviceAddress || "N/A";
  const serviceDate = currentBooking.serviceDate ? formatDate(currentBooking.serviceDate) : "Not Set";
  const creationDate = currentBooking.createdAt ? formatDate(currentBooking.createdAt) : "N/A";
  const timeSlot = currentBooking.serviceTimeSlot || "N/A";
  const amountFormatted = `₹${currentBooking.totalAmount != null ? currentBooking.totalAmount.toFixed(2) : '0.00'}`;

  // Determine if assignment controls should be shown
  // Maid can be assigned if status is Pending AND no maid is currently assigned
  const canAssignMaid = displayBookingStatus === "Pending" && !currentBooking.assignedMaid;

  return (
    <tr className={`hover:bg-gray-50 transition-colors duration-150 ${isSelected ? "bg-blue-50" : ""}`}>
      {/* Checkbox */}
      <td className="p-3">
         <input
             type="checkbox"
             checked={isSelected}
             onChange={() => onSelectBooking(currentBooking._id)}
             aria-labelledby={`booking-customer-${currentBooking._id}`}
             className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
           />
      </td>
      {/* Customer Info */}
      <td className="p-3 whitespace-nowrap">
        <div id={`booking-customer-${currentBooking._id}`} className="text-sm font-medium text-gray-900">{customerName}</div>
        <div className="text-xs text-gray-500">ID: {currentBooking._id.slice(-6)}</div>
      </td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{customerPhone}</td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{location}</td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">
          <div>{serviceDate}</div>
          <div className="text-xs text-gray-400">Booked: {creationDate}</div>
      </td>
      <td className="p-3 whitespace-nowrap text-sm text-gray-500">{timeSlot}</td>
      <td className="p-3 whitespace-nowrap text-sm font-medium text-gray-900">{amountFormatted}</td>
      {/* Booking Status Dropdown */}
       <td className="p-3 whitespace-nowrap">
         <div className="relative">
           <select
             value={displayBookingStatus}
             onChange={handleBookingStatusChange}
             className={`appearance-none w-full pl-7 pr-6 py-1 text-xs font-medium rounded-full border focus:outline-none focus:ring-1 focus:ring-blue-500 ${getBookingStatusStyles(displayBookingStatus)} ${loading.bookingStatus ? 'opacity-70 cursor-wait' : ''}`}
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
              {loading.bookingStatus ? <div className="animate-spin rounded-full h-3 w-3 border-t-1 border-b-1 border-gray-500"></div> : <StatusIcon status={displayBookingStatus} />}
           </div>
         </div>
       </td>
      {/* Payment Status Dropdown */}
      <td className="p-3 whitespace-nowrap">
          <div className="relative">
              <select
                  value={displayPaymentStatus}
                  onChange={handlePaymentStatusChange}
                  className={`appearance-none w-full px-3 py-1 text-xs font-medium rounded-full border focus:outline-none focus:ring-1 focus:ring-blue-500 ${getPaymentStatusStyles(displayPaymentStatus)} ${loading.paymentStatus ? 'opacity-70 cursor-wait' : ''}`}
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

      {/* Assigned Maid / Assign Controls */}
       <td className="p-3 whitespace-nowrap text-sm">
            {currentBooking.assignedMaid ? (
                // Display assigned maid's name (ensure your GET /orders populates this)
                <div className="text-gray-700 flex items-center gap-1">
                    <UserCheck size={14} className="text-blue-600"/>
                    {currentBooking.assignedMaid.fullName || `ID: ${currentBooking.assignedMaid._id?.slice(-6) || 'Assigned'}`}
                </div>
            ) : canAssignMaid ? (
                // Show assignment controls
                <div className="flex items-center gap-1">
                    <select
                        value={selectedMaidId}
                        onChange={(e) => setSelectedMaidId(e.target.value)}
                        className={`flex-grow appearance-none text-xs p-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 ${maidsLoading || loading.assigningMaid ? 'opacity-70 cursor-wait' : ''} ${availableMaids.length === 0 ? 'text-gray-400' : ''}`}
                        disabled={maidsLoading || loading.assigningMaid || availableMaids.length === 0}
                        aria-label={`Assign maid for ${customerName}`}
                    >
                        <option value="">{maidsLoading ? "Loading..." : availableMaids.length === 0 ? "No maids free" : "Select Maid..."}</option>
                        {availableMaids.map((maid) => (
                            <option key={maid._id} value={maid._id}>
                                {maid.fullName} {/* Make sure 'fullName' exists on maid object */}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={handleAssignMaid}
                        disabled={!selectedMaidId || loading.assigningMaid || maidsLoading}
                        className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                        title="Assign selected maid"
                    >
                        {loading.assigningMaid ? (
                           <div className="animate-spin rounded-full h-4 w-4 border-t-1 border-b-1 border-white mx-auto"></div>
                        ) : (
                           <UserPlus size={16} />
                        )}
                    </button>
                </div>
            ) : (
                 // Neither assigned nor assignable
                 <span className="text-gray-400 text-xs italic">
                     {displayBookingStatus === 'Pending' ? 'Not Assigned' : '-'}
                 </span>
            )}
        </td>


      {/* Actions */}
      <td className="p-3 whitespace-nowrap text-center text-sm font-medium">
        <button
          onClick={() => navigate(`/dashboard/orders/${currentBooking._id}`)} // Navigate to details page
          className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-1"
          title="View Booking Details"
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
};


// #############################################################
// #                  Pagination Component                     #
// #       (No changes needed here from the previous version)  #
// #############################################################
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
   const getVisiblePageNumbers = () => {
    if (totalPages <= 7) {
       return Array.from({ length: totalPages }, (_, i) => i + 1);
     }
     const visiblePages = [];
     visiblePages.push(1);
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
     visiblePages.push(totalPages);
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
             disabled={currentPage === totalPages || totalPages === 0}
             className={`flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-e-lg hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed`}
             aria-disabled={currentPage === totalPages || totalPages === 0}
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
