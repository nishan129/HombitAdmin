import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, X } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { useDispatch, useSelector } from "react-redux";
import { formatDate } from "@/utility/formateDate";
import { getErrorMessage } from "@/utility/getErrorMessage";
import { toast } from "react-toastify";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { removeNotification } from "@/features/notifications/notificationsSlice";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const notifications = useSelector((state) => state.notifications.items);
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleRemoveNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      await axiosPrivate.patch(`/api/v1/orders/${notificationId}/notifications/remove`);
      dispatch(removeNotification(notificationId));
      toast.success("Notification removed!");
    } catch (error) {
      toast.error(getErrorMessage(error).message);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button" className="relative p-3 rounded-lg bg-transparent">
          <Bell className="text-green-600" />
          <span className="sr-only">Notifications</span>
          {notifications.length > 0 && (
            <div className="absolute w-6 h-6 text-xs font-bold text-white bg-red-500 rounded-full -top-0 end-5 flex items-center justify-center">
              {notifications.length}
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-4">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-64">
          {notifications.map(({ _id, userImg, userFullName, userMo, orderStatus, createdAt, amount, orderItems }) => (
            <div key={_id}>
              <DropdownMenuItem>
                <div className="flex items-center justify-between w-full">
                  <img
                    src={userImg || "https://res.cloudinary.com/do3fiil0d/image/upload/v1731310660/defaultuseravatar_cvy0bs.avif"}
                    alt="User profile"
                    className="w-9 h-9 rounded-full border"
                  />
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/dashboard/orders/${_id}`);
                    }}
                    className="flex flex-col ml-3 cursor-pointer"
                  >
                    <p className="text-xs">Order from {userFullName || userMo}</p>
                    <div className="flex items-center space-x-5">
                      <p className="px-1 text-xs text-white bg-green-700 rounded-full">{orderStatus}</p>
                      <p className="text-xs">{formatDate(createdAt)}</p>
                    </div>
                    <p className="text-xs">
                      <span className="text-green-900">₹{amount.toFixed(2)}</span> ({orderItems.length} x Items)
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleRemoveNotification(e, _id)}
                    className="rounded-md hover:bg-red-200 p-1"
                  >
                    <X size={18} />
                  </button>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
