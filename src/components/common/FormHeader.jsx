import { X } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

export default function FormHeader({ title }) {
 const navigate = useNavigate();
  return (
    <div className="rounded-lg mt-3 shadow-lg flex justify-between space-x-3 bg-slate-100 dark:bg-slate-700 p-4 dark:text-slate-50 text-slate-900">
      <h2 className="text-xl  font-semibold">{title}</h2>
      <button onClick={() => navigate(-1)} className="">
        <X />
      </button>
    </div>
  );
}
