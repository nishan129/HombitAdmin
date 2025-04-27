import PageHeader from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { FilePen, Filter } from "lucide-react";
import React, { useState } from "react";
import CategoryTable from "./CategoryTable";

export default function Categories() {
 
  return (
    <div>
      {/* Header */}
      <PageHeader
        heading="Categories"
        LinkTitle="Add Category"
        href="/dashboard/categories/new"
      />

      <div className="rounded-lg mt-3 shadow-lg flex space-x-3 bg-slate-100 dark:bg-slate-700 p-6 dark:text-slate-50 text-slate-900">
        <Input className="" placeholder="filter by name" />
        <Button variant="" className="w-2/6 bg-green-600">
          <Filter size={20} className="mr-2" />
          Filter
        </Button>
        <Button disabled={true} variant="" className="w-2/6 ">
          <FilePen size={20} className="mr-2" />
          Bulk Action
        </Button>
      </div>
      {/* Table data */}
      <CategoryTable/>
    </div>
  );
}
