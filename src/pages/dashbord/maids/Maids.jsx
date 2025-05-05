import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage"; // Ensure this utility is robust
import { CheckCircle, XCircle, RefreshCw } from "lucide-react"; // Added RefreshCw for loading

// Import UI components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FormHeader from "@/components/common/FormHeader";

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
  // working status will be handled by API default value (usually true or false)
};

// Status icon component for visual indicators
const StatusIcon = ({ status }) => {
  return status ? (
    <CheckCircle size={16} className="text-green-500" />
  ) : (
    <XCircle size={16} className="text-red-500" />
  );
};

export default function Maids() {
  // State for the new maid form data
  const [newMaid, setNewMaid] = useState(initialMaidState);
  // State to store the list of maids fetched from the API
  const [maids, setMaids] = useState([]); // Initialize as empty array
  // State for loading indicators or disabling form during submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State for tracking status update loading states { [maidId]: boolean }
  const [loadingStatus, setLoadingStatus] = useState({});
  // Custom hook for making authenticated API requests
  const axiosPrivate = useAxiosPrivate();

  // --- Fetch Maids ---
  const fetchMaids = useCallback(async (showToast = false) => {
    console.log("Fetching maids...");
    try {
      const response = await axiosPrivate.get("/api/v1/maids");
      console.log("API Response:", response); // Log raw response

      let fetchedMaids = [];
      // Robustly handle different possible response structures
      if (Array.isArray(response.data)) {
        fetchedMaids = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        fetchedMaids = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        fetchedMaids = response.data.data;
      } else {
        console.error(
          "Fetched data is not in expected array format:",
          response.data
        );
        toast.error("Could not parse maids data correctly.");
        setMaids([]); // Set to empty array on structure error
        return;
      }

      // Ensure each maid has expected properties (like 'working')
      const processedMaids = fetchedMaids.map(maid => ({
        ...maid,
        working: typeof maid.working === 'boolean' ? maid.working : false // Default 'working' if missing/invalid
      }));

      // Sort alphabetically by name
      processedMaids.sort((a, b) => a.fullName.localeCompare(b.fullName));
      setMaids(processedMaids);
      if (showToast) {
        toast.success("Maid list refreshed.");
      }
      console.log("Processed Maids State:", processedMaids);
    } catch (error) {
      console.error("Error fetching maids:", error);
      let serverErrorMessage = getErrorMessage(error) || "Failed to fetch maids.";
      toast.error(serverErrorMessage);
      setMaids([]); // Ensure maids is an empty array on fetch error
    }
  }, [axiosPrivate]); // Dependency: axiosPrivate instance

  // Fetch maids when the component mounts
  useEffect(() => {
    fetchMaids();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch only once on mount

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
        [name]: value,
      },
    }));
  };

  // --- *** REVISED: Handle Working Status Update *** ---
  const handleWorkingStatusChange = async (maidId, newStatus) => {
    console.log(`Attempting to update status for Maid ID: ${maidId} to ${newStatus}`);

    // Find the current maid and their original status for potential rollback
    const currentMaid = maids.find(maid => maid._id === maidId);
    if (!currentMaid) {
        console.error("Maid not found in state:", maidId);
        toast.error("Could not find the maid to update.");
        return;
    }
    const originalStatus = currentMaid.working;

    // 1. Optimistic UI Update: Update the state immediately for responsiveness
    setMaids(prevMaids =>
      prevMaids.map(maid =>
        maid._id === maidId ? { ...maid, working: newStatus } : maid
      )
    );

    // 2. Set Loading State for this specific maid
    setLoadingStatus(prev => ({ ...prev, [maidId]: true }));

    try {
      // 3. Make API call to update status
      console.log(`Sending PATCH request to /api/v1/maids/${maidId}/working-status with payload:`, { working: newStatus });
      const response = await axiosPrivate.patch(`/api/v1/maids/${maidId}/working-status`, {
        working: newStatus
      });
      console.log("API response for status update:", response);

      // 4. Handle Successful API Response
      // Optional: If the API returns the updated maid object, use it to update state for accuracy.
      // Adjust `response.data.data` based on your actual API response structure.
      if (response.status === 200 && response.data?.data) {
         // Update the specific maid with the data confirmed by the server
         setMaids(prevMaids =>
            prevMaids.map(maid =>
              maid._id === maidId ? { ...maid, ...response.data.data } : maid // Merge server data
            )
         );
         toast.success(`${currentMaid.fullName}'s working status updated successfully!`);
      } else if (response.status === 200) {
         // If API just returns success (200 OK) without data, the optimistic update stands.
         toast.success(`${currentMaid.fullName}'s working status updated successfully! (API confirmed)`);
         // No state update needed here as optimistic update is already done.
      } else {
         // Handle unexpected success responses if necessary
         console.warn("Unexpected success response format:", response);
         toast.warn("Status updated, but response format was unexpected.");
      }

    } catch (error) {
      // 5. Handle API Error
      console.error(`Error updating working status for Maid ID: ${maidId}`, error);
      let errorMessage = getErrorMessage(error) || "Failed to update working status.";
      toast.error(`Update failed: ${errorMessage}`);

      // 6. Rollback the optimistic update on failure
      console.log(`Rolling back status for Maid ID: ${maidId} to ${originalStatus}`);
      setMaids(prevMaids =>
        prevMaids.map(maid =>
          maid._id === maidId ? { ...maid, working: originalStatus } : maid
        )
      );
    } finally {
      // 7. Clear Loading State regardless of success or failure
      console.log(`Clearing loading state for Maid ID: ${maidId}`);
      setLoadingStatus(prev => {
         const newLoadingStatus = { ...prev };
         delete newLoadingStatus[maidId]; // Remove the key entirely or set to false
         // return { ...prev, [maidId]: false }; // Alternative way to set to false
         return newLoadingStatus;
      });
    }
  };


  // --- Handle Form Submission ---
  const handleMaidSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!newMaid.fullName || !newMaid.phone) {
      toast.error("Full Name and Phone are required.");
      setIsSubmitting(false);
      return;
    }

    console.log("Submitting new maid:", newMaid);
    try {
      const response = await axiosPrivate.post("/api/v1/maids", newMaid);
      console.log("Add Maid API Response:", response);

      // Expecting 201 Created with the new maid object in response.data or response.data.data
      let addedMaid = null;
      if (response.status === 201 && response.data) {
           if (response.data.data) { // Handles { success: true, data: {...}}
               addedMaid = response.data.data;
           } else if (typeof response.data === 'object' && response.data._id) { // Handles if API returns the object directly
               addedMaid = response.data;
           }
      }

      if (addedMaid) {
        toast.success("Maid added successfully!");
        // Add the new maid returned from the API to the local state and sort
        setMaids((prevMaids) =>
            [...prevMaids, addedMaid].sort((a, b) => a.fullName.localeCompare(b.fullName))
        );
        setNewMaid(initialMaidState); // Reset form
      } else {
        console.warn("Unexpected response format on success:", response);
        toast.error(response.data?.message || "Failed to add maid (unexpected response).");
      }
    } catch (error) {
      console.error("Error while creating maid: ", error);
      let errorMessage = getErrorMessage(error) || "An unexpected error occurred while adding the maid.";
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Handle Delete ---
  const handleDeleteMaid = async (maidId) => {
    const maidToDelete = maids.find(m => m._id === maidId);
    if (!maidToDelete) return;

    if (!window.confirm(`Are you sure you want to delete ${maidToDelete.fullName}?`)) {
      return;
    }

    console.log(`Attempting to delete Maid ID: ${maidId}`);
    // Optional: Optimistic UI update (remove immediately)
    // const originalMaids = [...maids];
    // setMaids(maids.filter(maid => maid._id !== maidId));

    try {
      await axiosPrivate.delete(`/api/v1/maids/${maidId}`);
      toast.success(`${maidToDelete.fullName} deleted successfully!`);
      // If not doing optimistic update, update UI after successful deletion:
       setMaids(prevMaids => prevMaids.filter(maid => maid._id !== maidId));
    } catch (error) {
      console.error("Error deleting maid:", error);
      let errorMessage = getErrorMessage(error) || "Failed to delete maid.";
      toast.error(errorMessage);
      // Optional: Rollback optimistic update if it was used
      // setMaids(originalMaids);
    }
  };

  // --- Handle Edit (Placeholder) ---
  const handleEditMaid = (maid) => {
    console.log("Edit functionality for maid:", maid, "not implemented yet.");
    toast.info("Edit function needs implementation (e.g., open modal/form).");
    // Implementation Idea:
    // 1. Set an 'editingMaid' state with the maid's data.
    // 2. Open a modal or populate a separate form with 'editingMaid' data.
    // 3. Handle submission in the modal/edit form to call a PATCH/PUT request.
    // 4. Update the 'maids' state upon successful edit.
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <FormHeader title="Manage Maids" />

      {/* Add New Maid Form */}
      <form
        onSubmit={handleMaidSubmit}
        className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-4 max-w-2xl mx-auto"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Add New Maid</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input id="fullName" name="fullName" value={newMaid.fullName} onChange={handleInputChange} placeholder="Enter full name" required disabled={isSubmitting} />
          </div>
          {/* Phone */}
          <div className="space-y-1">
            <Label htmlFor="phone">Phone <span className="text-red-500">*</span></Label>
            <Input id="phone" name="phone" type="tel" value={newMaid.phone} onChange={handleInputChange} placeholder="Enter phone number" required disabled={isSubmitting} />
          </div>
          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={newMaid.email} onChange={handleInputChange} placeholder="Enter email address (optional)" disabled={isSubmitting} />
          </div>
          {/* Street */}
          <div className="space-y-1">
            <Label htmlFor="street">Street Address</Label>
            <Input id="street" name="street" value={newMaid.address.street} onChange={handleAddressChange} placeholder="Enter street address" disabled={isSubmitting} />
          </div>
          {/* City */}
          <div className="space-y-1">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" value={newMaid.address.city} onChange={handleAddressChange} placeholder="Enter city" disabled={isSubmitting} />
          </div>
          {/* State */}
          <div className="space-y-1">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" value={newMaid.address.state} onChange={handleAddressChange} placeholder="Enter state" disabled={isSubmitting} />
          </div>
          {/* Postal Code */}
          <div className="space-y-1">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" name="postalCode" value={newMaid.address.postalCode} onChange={handleAddressChange} placeholder="Enter postal code" disabled={isSubmitting} />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add Maid"}
          </Button>
        </div>
      </form>

      {/* Maids List Table */}
      <div className="mt-8 overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Maid List</h3>
          <Button
            onClick={() => fetchMaids(true)} // Pass true to show toast on manual refresh
            variant="outline"
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
            // Add loading state for refresh maybe?
          >
            Refresh List
          </Button>
        </div>

        <table className="min-w-full border-collapse border border-gray-300 bg-white shadow rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">S.No.</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">Full Name</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">Phone</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">Email</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">Working Status</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">Joined At</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Display Loading or No Data */}
            {maids === null && ( // Check for null if you have an initial loading state maybe
                 <tr><td colSpan="7" className="p-4 text-center text-gray-500 border border-gray-300">Loading maids...</td></tr>
            )}
            {maids && maids.length === 0 && (
                 <tr><td colSpan="7" className="p-4 text-center text-gray-500 border border-gray-300">No maids found. Add one using the form above.</td></tr>
            )}

            {/* Display Maid Rows */}
            {maids && maids.length > 0 && maids.map((maid, index) => (
              <tr key={maid._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3 text-sm text-gray-700 border border-gray-300">{index + 1}</td>
                <td className="p-3 text-sm text-gray-700 border border-gray-300">{maid.fullName}</td>
                <td className="p-3 text-sm text-gray-700 border border-gray-300">{maid.phone}</td>
                <td className="p-3 text-sm text-gray-700 border border-gray-300">{maid.email || "N/A"}</td>
                <td className="p-3 text-sm border border-gray-300">
                  {/* Working Status Dropdown */}
                  <div className="relative">
                    <select
                      // The value should map the boolean state back to the string options
                      value={maid.working ? "Working" : "Not Working"}
                      // onChange converts the selected string option back to a boolean for the handler
                      onChange={(e) => handleWorkingStatusChange(maid._id, e.target.value === "Working")}
                      className={`appearance-none w-full pl-7 pr-6 py-1 text-xs font-medium rounded-full border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        maid.working
                          ? 'bg-green-100 text-green-800 border-green-200'
                          : 'bg-red-100 text-red-800 border-red-200'
                      } ${loadingStatus[maid._id] ? 'opacity-70 cursor-wait' : ''}`}
                      disabled={loadingStatus[maid._id]} // Disable while this specific maid's status is updating
                      aria-label={`Working status for ${maid.fullName}`}
                    >
                      <option value="Working">Working</option>
                      <option value="Not Working">Not Working</option>
                    </select>
                    {/* Icon indicating status or loading */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                      {loadingStatus[maid._id] ? (
                        <RefreshCw size={14} className="animate-spin text-gray-500" /> // Use loading icon
                      ) : (
                        <StatusIcon status={maid.working} /> // Use status icon
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-3 text-sm text-gray-700 border border-gray-300">
                  {/* Format date nicely */}
                  {maid.joinedAt ? new Date(maid.joinedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}
                </td>
                <td className="p-3 border border-gray-300">
                  <div className="flex space-x-2">
                    {/* Edit Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-600 border-blue-600 hover:bg-blue-50 px-2 py-1 text-xs" // Adjusted size/padding
                      onClick={() => handleEditMaid(maid)}
                      title={`Edit ${maid.fullName}`} // Tooltip
                    >
                      Edit
                    </Button>
                    {/* Delete Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600 hover:bg-red-50 px-2 py-1 text-xs" // Adjusted size/padding
                      onClick={() => handleDeleteMaid(maid._id)}
                      title={`Delete ${maid.fullName}`} // Tooltip
                      disabled={loadingStatus[maid._id]} // Disable delete while status is changing? Maybe not necessary.
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}