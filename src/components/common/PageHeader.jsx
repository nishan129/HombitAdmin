import { Plus } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import Heading from "./Heading";

export default function PageHeader({ heading, LinkTitle, href, data }) {
  return (
    <div className="flex justify-between py-4">
      <Heading title={heading} />
      <Link
        className="text-white bg-green-600 hover:bg-green-600/90 focus:ring-2 focus:outline-none focus:ring-green-600/50 font-medium rounded-lg text-base px-2 py-2.5 text-center inline-flex items-center dark:focus:ring-green-600/55 me-1 space-x-3"
        to={href}
        state={data}
      >
        <Plus />
        <spam> {LinkTitle}</spam>
      </Link>
    </div>
  );
}
