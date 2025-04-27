import { createUnit, getAllUnit } from "@/api/ApiRoutes";
import FormHeader from "@/components/common/FormHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function Units() {
  const [unit, setUnit] = useState("");
  const [units, setUnits] = useState([]);
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    (async () => {
      const response = await axiosPrivate.get("/api/v1/units");
      if (response.data.success) {
        setUnits(response.data.data);
      }
    })();
  }, []);

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosPrivate.post("/api/v1/units", { unit });
      if (response.data.success) {
        setUnit("");
        toast.success(response.data.message);
        setUnits([...units, response.data.data]);
      }
    } catch (error) {
      console.log("Error while creating unit: ", error);
      const { message } = getErrorMessage(error);
      table.error(message);
    }
  };
  return (
    <div>
      <FormHeader title="Units (Add, Update, Delete)" />
      <div className="w-full flex flex-col items-center mt-8">
        <form onSubmit={handleUnitSubmit} className="flex mb-3">
          <Input
            onChange={(e) => setUnit(e.target.value)}
            required={true}
            value={unit}
            min={1}
            placeholder="create unit"
          />
          <Button type="submit" className="bg-green-700 ml-4">
            Add Unit
          </Button>
        </form>
        <table className="md:w-[750px] w-full border-collapse border border-gray-200 bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border border-gray-300">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </th>
              <th className="p-2 text-left border border-gray-300">S.No.</th>
              <th className="p-2 text-left border border-gray-300">Unit</th>
              <th className="p-2 text-left border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit, index) => {
              return (
                <tr key={unit._id} className="border border-gray-300">
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="p-2 text-left">{index}</td>
                  <td className="p-2 text-left">{unit.unit}</td>
                  <td className="p-2 flex space-x-2">
                    <button className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Edit
                    </button>
                    <button className="px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
