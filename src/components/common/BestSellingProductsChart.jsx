"use client";
import React, { useState, useEffect } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function BestSellingProductsChart({ orders }) {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (orders && orders.length) {
      const productSales = {};

      orders.forEach((order) => {
        order.orderItems.forEach((item) => {
          if (productSales[item.title]) {
            productSales[item.title] += item.quantity;
          } else {
            productSales[item.title] = item.quantity;
          }
        });
      });

      // Filter products with sales greater than 5
      const filteredProductSales = Object.entries(productSales).filter(
        ([_, quantity]) => quantity > 1
      );
      const labels = filteredProductSales.map(([title, _]) => title);
      const data = filteredProductSales.map(([_, quantity]) => quantity);

      setChartData({
        labels,
        datasets: [
          {
            label: "# of Sales",
            data,
            backgroundColor: [
              "rgba(0, 0, 255, 0.7)",
              "rgb(255, 230, 0)",
              "rgba(2, 139, 71, 0.7)",
              "rgba(255, 0, 0, 0.676)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)", // Additional color
              "rgba(255, 159, 64, 0.7)", // Additional color
              "rgba(54, 162, 235, 0.7)", // Additional color
              "rgba(255, 99, 132, 0.7)", // Additional color
              "rgba(255, 206, 86, 0.7)", // Additional color
            ],
            borderColor: [
              "rgba(0, 0, 255, 0.3)",
              "rgb(255, 230, 0)",
              "rgba(2, 139, 71, 0.3)",
              "rgba(255, 0, 0, 0.3)",
              "rgba(75, 192, 192, 0.3)",
              "rgba(153, 102, 255, 0.3)", // Additional color
              "rgba(255, 159, 64, 0.3)", // Additional color
              "rgba(54, 162, 235, 0.3)", // Additional color
              "rgba(255, 99, 132, 0.3)", // Additional color
              "rgba(255, 206, 86, 0.3)", // Additional color
            ],
            borderWidth: 1,
          },
        ],
      });
    }
  }, [orders]);

  return (
    <div className="dark:bg-slate-700 bg-slate-50 p-8 rounded-lg shadow-2xl">
      <h2 className="text-xl font-bold mb-3 text-slate-800 dark:text-slate-50">
        Best Selling Products
      </h2>
      <div className="p-4">
        <Pie data={chartData} />
      </div>
    </div>
  );
}
