import { getAllCategories, getAllSubCategories } from "@/api/ApiRoutes";
import { TablePagination } from "@/components/common/TablePagination";
import UpdateSheet from "@/components/common/UpdateSheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import UpdateSubCategory from "./UpdateSubCategory";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { getErrorMessage } from "@/utility/getErrorMessage";

export default function SubCategoryTable() {
  const [subCategories, setSubCategories] = useState([]);
  const [subCategoryForUpdate, setSubCategoryForUpdate] = useState({
    isOpen: false,
    subCategory: null,
  });
  const axiosPrivate = useAxiosPrivate();
  const btnRef = useRef(null);
  useEffect(() => {
    (async () => {
      try {
        const response = await axiosPrivate.get("/api/v1/subcategories");
        if (response.data.success) {
          setSubCategories(response.data.data);
        }
      } catch (error) {
        console.log("Error while fetching subcategories: ", error);
        const { message } = getErrorMessage(error);
        toast.error(message);
      }
    })();
  }, []);
  return (
    <div>
      <UpdateSheet btnRef={btnRef} title="Update Sub Category">
        {subCategoryForUpdate.isOpen && (
          <UpdateSubCategory
            btnRef={btnRef}
            subCategoryForUpdate={subCategoryForUpdate}
          />
        )}
      </UpdateSheet>
      <div className="overflow-x-auto mt-7">
        <table className="min-w-full border-collapse border border-gray-200 bg-white">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border border-gray-300">
                <input
                  type="checkbox"
                  className="form-checkbox h-5 w-5 text-blue-600"
                />
              </th>
              <th className="p-2 text-left border border-gray-300">Title</th>
              <th className="p-2 text-left border border-gray-300">Image</th>
              <th className="p-2 text-left border border-gray-300">
                Description
              </th>
              <th className="p-2 text-left border border-gray-300">Category</th>
              <th className="p-2 text-left border border-gray-300">Active</th>
              <th className="p-2 text-left border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subCategories.map((subCategory) => {
              return (
                <tr key={subCategory._id} className="border border-gray-300">
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600"
                    />
                  </td>
                  <td className="p-2 text-left">{subCategory.title}</td>
                  <td className="p-2 text-left">
                    <Avatar>
                      <AvatarImage src={subCategory.imageUrl} />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </td>
                  <td className="p-2 text-left">{subCategory.description}</td>
                  <td className="p-2 text-left">
                    {subCategory.category.title}
                  </td>
                  <td className="p-2 text-left">
                    {subCategory.isActive ? "Yes" : "Not"}
                  </td>
                  <td className="p-2 flex space-x-2">
                    <button
                      onClick={() => {
                        setSubCategoryForUpdate({
                          isOpen: true,
                          subCategory: subCategory,
                        });
                        console.log(btnRef);
                        if (btnRef.current) {
                          console.log("click btn1", btnRef);
                          btnRef.current.click();
                        }
                      }}
                      className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
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
      <TablePagination />
    </div>
  );
}
