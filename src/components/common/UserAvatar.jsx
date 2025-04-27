import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/features/auth/authSlice";

export default function UserAvatar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth); // Get user from Redux

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/auth");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none">
          <img
            src={user?.avatar || "https://res.cloudinary.com/do3fiil0d/image/upload/v1731310660/defaultuseravatar_cvy0bs.avif"}
            alt="User profile"
            width={40}
            height={40}
            className="w-8 h-8 rounded-full"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="px-4 py-2 pr-8">
        <DropdownMenuLabel>{user?.name || "User"}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center">
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/dashboard/profile" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Edit Profile</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
