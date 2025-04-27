import React from "react";
import WeeklySalesChart from "./WeeklySalesChart";
import BestSellingProductsChart from "./BestSellingProductsChart";

export default function DashboardCharts({ sales, orders }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ">
      <WeeklySalesChart sales={sales} orders={orders} />
      <BestSellingProductsChart orders={orders} />
    </div>
  );
}
