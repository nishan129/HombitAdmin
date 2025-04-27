import { BadgeIndianRupee, IndianRupee } from 'lucide-react';
import React from 'react'

export default function LargeCard({data}) {
  return (
    <div
      className={`rounded-lg text-white shadow-md p-6 flex items-center flex-col gap-2 ${data.color}`}
    >
      <BadgeIndianRupee className="h-6 w-6" />
      <h4 className="text-lg font-semibold">{data.period}</h4>
      <h2 className="lg:text-3xl text-2xl flex items-center gap-1">
        <IndianRupee className="h-6 w-6" />
        {data.sales}
      </h2>
    </div>
  );
}
