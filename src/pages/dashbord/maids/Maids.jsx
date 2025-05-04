import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate"; // Assuming this hook provides an authenticated axios instance
import { getErrorMessage } from "@/utility/getErrorMessage"; // Assuming this utility parses error messages

// Import UI components (assuming shadcn/ui setup)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
 // For the 'working' status potentially
import FormHeader from "@/components/common/FormHeader"; // Assuming this is a common header component

// Define the structure for a new maid based on the schema
const initialMaidState = {
  fullName: "",
  phone: "",
  email: "",
  address: {
    street: "",
    city: "",
    state: "",
    postalCode: "",
  },
  // 'working' status might be set by default on backend or handled differently
};

export default function Maids() {
  // State for the new maid form data
  const [newMaid, setNewMaid] = useState(initialMaidState);
  // State to store the list of maids fetched from the API
  const [maids, setMaids] = useState([]);
  // State for loading indicators or disabling form during submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Custom hook for making authenticated API requests
  const axiosPrivate = useAxiosPrivate();

  // --- Fetch Maids ---
  const fetchMaids = async () => {
    try {
      // Use the correct endpoint based on your backend route setup
      const response = await axiosPrivate.get("/api/v1/maids");

      // Adjust success/data checking based on actual backend response structure
      // Assuming backend sends { success: true, data: [...] } or just [...]
       if (Array.isArray(response.data)) {
         // If backend directly sends the array
         setMaids(response.data);
       } else if (response.data && Array.isArray(response.data.data)) {
         // If backend sends { success: true, data: [...] }
         setMaids(response.data.data);
       } else if (response.data.success && Array.isArray(response.data.data)) {
         // Handle potential structure from previous attempts if necessary
         setMaids(response.data.data);
       }
        else {
        console.error("Fetched data is not in expected format:", response.data);
        setMaids([]); // Reset to empty array
        toast.error("Could not fetch maids data correctly.");
      }
    } catch (error) {
      console.error("Error fetching maids:", error);
      // Use the improved error message extraction
      let serverErrorMessage = "Failed to fetch maids.";
       if (error.response && error.response.data && error.response.data.error) {
           serverErrorMessage = `Failed to fetch maids: ${error.response.data.error}`;
       } else if (error.message) {
           serverErrorMessage = `Failed to fetch maids: ${error.message}`;
       }
      toast.error(serverErrorMessage);
      setMaids([]); // Ensure maids is an array even on error
    }
  };

  // Fetch maids when the component mounts
  useEffect(() => {
    fetchMaids();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Handle Form Input Changes ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMaid((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setNewMaid((prevState) => ({
      ...prevState,
      address: {
        ...prevState.address,
        [name]: value, // Update nested address field
      },
    }));
  };

  // --- Handle Form Submission ---
  const handleMaidSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsSubmitting(true); // Disable form/show loading state

    // Basic Validation (add more as needed)
    if (!newMaid.fullName || !newMaid.phone) {
        toast.error("Full Name and Phone are required.");
        setIsSubmitting(false);
        return;
    }

    try {
      // API call to create a new maid - Ensure endpoint is correct
      const response = await axiosPrivate.post("/api/v1/maids", newMaid);

       // Adjust success checking based on backend response for createMaid
       // Your backend createMaid sends the created maid object directly on 201 status
       // It doesn't wrap it in { success: true, data: ... }
       if (response.status === 201 && response.data) {
         toast.success("Maid added successfully!"); // Use a generic success message
         // Add the new maid returned from the API to the local state
         setMaids((prevMaids) => [...prevMaids, response.data]);
         // Reset the form fields
         setNewMaid(initialMaidState);
       } else {
         // Handle unexpected successful responses if necessary
         console.warn("Unexpected response format on success:", response);
         toast.error(response.data.message || "Failed to add maid (unexpected response).");
       }

    } catch (error) {
      // --- *** IMPROVED ERROR HANDLING *** ---
      console.error("Error while creating maid: ", error); // Log the full Axios error object

      let serverErrorMessage = "An unexpected error occurred while adding the maid."; // Default message

      // Check if the error has a response from the server
      if (error.response) {
          console.error("Server Response Status:", error.response.status); // Log status (400)
          console.error("Server Response Data:", error.response.data); // Log the data sent back by the server

          // Extract the specific error message from the backend response ({ error: "message" })
          if (error.response.data && error.response.data.error) {
              serverErrorMessage = error.response.data.error;
          } else if (typeof error.response.data === 'string') {
             // Handle cases where the error might be plain text
             serverErrorMessage = error.response.data;
          } else {
             // Fallback if data is not in the expected {error: ...} format
             serverErrorMessage = error.message || `Request failed with status code ${error.response.status}`;
          }
      } else if (error.request) {
          // The request was made but no response was received
          console.error("No response received:", error.request);
          serverErrorMessage = "Could not connect to the server. Please check your network.";
      } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error setting up request:', error.message);
          serverErrorMessage = `Error: ${error.message}`;
      }

      // Display the specific error message using toast
      toast.error(`Error: ${serverErrorMessage}`);
      // --- *** END OF IMPROVED ERROR HANDLING *** ---

    } finally {
      setIsSubmitting(false); // Re-enable form
    }
  };

  // --- Handle Delete (Placeholder) ---
  const handleDeleteMaid = async (maidId) => {
    if (!window.confirm("Are you sure you want to delete this maid?")) {
        return;
    }
    try {
        // Implement actual delete API call
        await axiosPrivate.delete(`/api/v1/maids/${maidId}`);
        toast.success("Maid deleted successfully!");
        setMaids(maids.filter(maid => maid._id !== maidId)); // Update UI
    } catch (error) {
        console.error("Error deleting maid:", error);
         let serverErrorMessage = "Failed to delete maid.";
         if (error.response && error.response.data && error.response.data.error) {
             serverErrorMessage = `Failed to delete maid: ${error.response.data.error}`;
         } else if (error.message) {
             serverErrorMessage = `Failed to delete maid: ${error.message}`;
         }
        toast.error(serverErrorMessage);
    }
  };

  // --- Handle Edit (Placeholder) ---
   const handleEditMaid = (maid) => {
    console.log("Edit functionality for maid:", maid, "not implemented yet.");
    toast.info("Edit function needs implementation (e.g., open modal/form).");
    // Example: Populate form for editing
    // setNewMaid({
    //     _id: maid._id, // Need ID for update request
    //     fullName: maid.fullName,
    //     phone: maid.phone,
    //     email: maid.email || "",
    //     address: {
    //         street: maid.address?.street || "",
    //         city: maid.address?.city || "",
    //         state: maid.address?.state || "",
    //         postalCode: maid.address?.postalCode || "",
    //     },
    // });
    // Add state to manage edit mode vs add mode
  };


  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header for the section */}
      <FormHeader title="Manage Maids" />

      {/* Form for adding a new maid */}
      <form
        onSubmit={handleMaidSubmit}
        className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4 max-w-2xl mx-auto"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Maid</h3>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              name="fullName"
              value={newMaid.fullName}
              onChange={handleInputChange}
              placeholder="Enter full name"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
            <Input
              id="phone"
              name="phone"
              type="tel" // Use tel type for phone numbers
              value={newMaid.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={newMaid.email}
              onChange={handleInputChange}
              placeholder="Enter email address (optional)"
              disabled={isSubmitting}
            />
          </div>

          {/* Street Address */}
          <div className="space-y-1">
            <Label htmlFor="street">Street Address</Label>
            <Input
              id="street"
              name="street" // Corresponds to address.street
              value={newMaid.address.street}
              onChange={handleAddressChange} // Use specific handler for address
              placeholder="Enter street address"
              disabled={isSubmitting}
            />
          </div>

          {/* City */}
          <div className="space-y-1">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              name="city" // Corresponds to address.city
              value={newMaid.address.city}
              onChange={handleAddressChange}
              placeholder="Enter city"
              disabled={isSubmitting}
            />
          </div>

          {/* State */}
          <div className="space-y-1">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              name="state" // Corresponds to address.state
              value={newMaid.address.state}
              onChange={handleAddressChange}
              placeholder="Enter state"
              disabled={isSubmitting}
            />
          </div>

          {/* Postal Code */}
          <div className="space-y-1">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode" // Corresponds to address.postalCode
              value={newMaid.address.postalCode}
              onChange={handleAddressChange}
              placeholder="Enter postal code"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Maid"}
          </Button>
        </div>
      </form>

      {/* Table displaying the list of maids */}
      <div className="mt-8 overflow-x-auto">
         <h3 className="text-lg font-semibold mb-4 text-gray-700">Maid List</h3>
        <table className="min-w-full border-collapse border border-gray-300 bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {/* Removed checkbox for simplicity, add back if needed */}
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border border-gray-300">S.No.</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border border-gray-300">Full Name</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border border-gray-300">Phone</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border border-gray-300">Email</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border border-gray-300">Working Status</th>
               <th className="p-3 text-left text-sm font-semibold text-gray-600 border border-gray-300">Joined At</th>
              <th className="p-3 text-left text-sm font-semibold text-gray-600 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Check if maids array exists and has items */}
            {maids && maids.length > 0 ? (
              maids.map((maid, index) => (
                <tr key={maid._id} className="border-b border-gray-200 hover:bg-gray-50">
                  {/* Removed checkbox cell */}
                  <td className="p-3 text-sm text-gray-700 border border-gray-300">{index + 1}</td>
                  <td className="p-3 text-sm text-gray-700 border border-gray-300">{maid.fullName}</td>
                  <td className="p-3 text-sm text-gray-700 border border-gray-300">{maid.phone}</td>
                  <td className="p-3 text-sm text-gray-700 border border-gray-300">{maid.email || "N/A"}</td>
                   <td className="p-3 text-sm text-gray-700 border border-gray-300">
                     {/* Display working status - consider using a badge */}
                     <span className={`px-2 py-1 rounded-full text-xs font-medium ${maid.working ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                       {maid.working ? "Working" : "Not Working"}
                     </span>
                   </td>
                   <td className="p-3 text-sm text-gray-700 border border-gray-300">
                     {/* Format the date nicely */}
                     {maid.joinedAt ? new Date(maid.joinedAt).toLocaleDateString() : "N/A"}
                   </td>
                  <td className="p-3 border border-gray-300">
                    <div className="flex space-x-2">
                       {/* Edit Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                        onClick={() => handleEditMaid(maid)}
                      >
                        Edit
                      </Button>
                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => handleDeleteMaid(maid._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              // Display a message if there are no maids
              <tr>
                <td colSpan="7" className="p-4 text-center text-gray-500 border border-gray-300">
                  {/* Add a loading state or check if fetch is complete */}
                  Loading maids or no maids found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
