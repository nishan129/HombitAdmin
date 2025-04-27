import React from 'react'
import LargeCard from './LargeCard';


export default function LargeCards({ sales }) {

  const orderStats = [
    {
      period: "Today Sales",
      sales: "todaySales",
      color: "bg-green-600",
    },
    {
      period: "This Week",
      sales: "thisWeekSales",
      color: "bg-blue-600",
    },
    {
      period: "This Month",
      sales: "thisMonthSales",
      color: "bg-orange-600",
    },
    {
      period: "All-Time Sales",
      sales: "totalSales",
      color: "bg-purple-600",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 py-8">
      {orderStats.map((item, i) => {
        return <LargeCard className="bg-green-600" data={item} key={i} />;
      })}
    </div>
  );
}

