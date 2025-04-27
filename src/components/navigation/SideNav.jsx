import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import menuItems from "@/config/menuItem";
import { Button } from "../ui/button";

export default function SideNav({ showSidebar, setShowSidebar }) {
  const { pathname } = useLocation();

  return (
    <div>
      <Link to="/dashboard" className="px-4 py-2">
        {/* <img src={""} alt="E-APP" className="w-1/2" /> */}
      </Link>
      <div className="space-y-3 flex flex-col">
        {menuItems.map((item, i) => {
          const Icon = item.icon;
          return (
            <Link
              key={i}
              to={item.href}
              className={`flex items-center space-x-2 px-4 py-2 border-l-4 ${
                pathname === item.href
                  ? "border-green-600 text-green-600"
                  : "border-transparent"
              }`}
            >
              <Icon />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <div className="px-6 py-8 flex justify-center text-slate-50 ">
          <Button
            onClick={() => setShowSidebar(!showSidebar)}
            variant=""
            className="w-full bg-green-600"
          >
            <LogOut />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
