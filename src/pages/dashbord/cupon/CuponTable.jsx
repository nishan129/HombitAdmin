import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";

// Components
import { TablePagination } from "@/components/common/TablePagination";
import UpdateSheet from "@/components/common/UpdateSheet";

import UpdateCupon from "./UpdateCupon";
export default function CouponTable() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [couponForUpdate, setCouponForUpdate] = useState({
    isOpen: false,
    coupon: null,
  });
  const [selectedCoupons, setSelectedCoupons] = useState([]);
  
  const axiosPrivate = useAxiosPrivate();
  const btnRef = useRef(null);
  
  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axiosPrivate.get("/api/v1/cupons");
      setCoupons(response.data.data);
    } catch (error) {
      const { message } = getErrorMessage(error);
      toast.error(`Failed to fetch coupons: ${message}`);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCoupons();
  }, []);
  
  const handleCouponUpdate = (coupon) => {
    setCouponForUpdate({
      isOpen: true,
      coupon: coupon,
    });
    
    if (btnRef.current) {
      btnRef.current.click();
    }
  };
  
  const handleCouponDelete = async (couponId) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) {
      return;
    }
    
    try {
      await axiosPrivate.delete(`/api/v1/cupons/${couponId}`);
      toast.success("Coupon deleted successfully");
      fetchCoupons(); // Refresh the list
    } catch (error) {
      const { message } = getErrorMessage(error);
      toast.error(`Failed to delete coupon: ${message}`);
    }
  };
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCoupons(coupons.map(coupon => coupon._id));
    } else {
      setSelectedCoupons([]);
    }
  };
  
  const handleSelectCoupon = (couponId) => {
    if (selectedCoupons.includes(couponId)) {
      setSelectedCoupons(selectedCoupons.filter(id => id !== couponId));
    } else {
      setSelectedCoupons([...selectedCoupons, couponId]);
    }
  };
  
  const handleBulkDelete = async () => {
    if (selectedCoupons.length === 0) {
      toast.warning("No coupons selected");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedCoupons.length} coupons?`)) {
      return;
    }
    
    try {
      await axiosPrivate.post("/api/v1/cupons/bulk-delete", { ids: selectedCoupons });
      toast.success(`${selectedCoupons.length} coupons deleted successfully`);
      setSelectedCoupons([]);
      fetchCoupons(); // Refresh the list
    } catch (error) {
      const { message } = getErrorMessage(error);
      toast.error(`Failed to delete coupons: ${message}`);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Coupons</h2>
        {selectedCoupons.length > 0 && (
          <button 
            onClick={handleBulkDelete}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Selected ({selectedCoupons.length})
          </button>
        )}
      </div>
      
      <UpdateSheet btnRef={btnRef} title="Update Coupon">
        {couponForUpdate.isOpen && (
          <UpdateCupon 
            btnRef={btnRef} 
            couponForUpdate={couponForUpdate.coupon} 
            onUpdate={fetchCoupons}
          />
        )}
      </UpdateSheet>
      
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          {coupons.length === 0 ? (
            <div className="text-center py-8 bg-white border rounded">
              <p className="text-gray-500">No coupons found</p>
            </div>
          ) : (
            <table className="min-w-full border-collapse border border-gray-200 bg-white">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border border-gray-300">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                      checked={selectedCoupons.length === coupons.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="p-2 text-left border border-gray-300">Title</th>
                  <th className="p-2 text-left border border-gray-300">Discount</th>
                  <th className="p-2 text-left border border-gray-300">Status</th>
                  <th className="p-2 text-left border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border border-gray-300 hover:bg-gray-50">
                    <td className="p-2 text-center">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-blue-600"
                        checked={selectedCoupons.includes(coupon._id)}
                        onChange={() => handleSelectCoupon(coupon._id)}
                      />
                    </td>
                    <td className="p-2 text-left">{coupon.title}</td>
                    <td className="p-2 text-left">{coupon.discount}%</td>
                    <td className="p-2 text-left">
                      <span className={`px-2 py-1 rounded text-xs ${coupon.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleCouponUpdate(coupon)}
                          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleCouponDelete(coupon._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      <TablePagination />
    </div>
  );
}