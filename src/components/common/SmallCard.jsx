import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

const SmallCard = ({ data }) => {
  const { title, number, iconBg, icon: Icon, percentChange, isLoading } = data;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          <Icon size={20} className="text-white" strokeWidth={2.5} />
        </div>
        
        {percentChange !== undefined && !isLoading && (
          <div className={`flex items-center text-xs font-medium ${
            percentChange > 0 ? 'text-emerald-600' : 
            percentChange < 0 ? 'text-rose-600' : 'text-gray-500'
          }`}>
            {percentChange > 0 ? (
              <ArrowUp size={14} className="mr-1" />
            ) : percentChange < 0 ? (
              <ArrowDown size={14} className="mr-1" />
            ) : null}
            <span>{Math.abs(percentChange)}%</span>
          </div>
        )}
        
        {isLoading && (
          <div className="w-10 h-5 bg-gray-200 animate-pulse rounded"></div>
        )}
      </div>
      
      <div className="mt-1">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{title}</p>
        {isLoading ? (
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
        ) : (
          <h3 className="text-2xl font-bold text-gray-800">{number.toLocaleString()}</h3>
        )}
      </div>
    </div>
  );
};

export default SmallCard;