import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAxiosPrivate } from "@/hooks/useAxiosPrivate";
import { useDispatch, useSelector } from "react-redux";
import SideNav from "../navigation/SideNav";
import Header from "../navigation/Header";
import { setUser } from "@/features/auth/authSlice";
import SocketService from "@/api/socketService";
import {
  addNotification,
  setNotifications,
} from "@/features/notifications/notificationsSlice";

export default function MainContainer() {
  const [showSidebar, setShowSidebar] = useState(true);
  const axiosPrivate = useAxiosPrivate();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    if (accessToken) {
      (async () => {
        try {
          // Fetch current user
          const userResponse = await axiosPrivate.get(
            "/api/v1/users/auth/current-user"
          );
          dispatch(setUser(userResponse.data.data)); // Set user in Redux
          // Fetch notifications
          const notificationsResponse = await axiosPrivate.get(
            "/api/v1/orders/notifications"
          );
          dispatch(setNotifications(notificationsResponse.data.data)); // Set notifications in Redux
        } catch (error) {
          console.log("Error while fetching user or notifications:", error);
        }
      })();
    }
  }, [accessToken, axiosPrivate]);

  // Establish socket connection after the user is fetched
  // useEffect(() => {
  //   if (user) {
  //     // Connect socket when user is available
  //     const socketInstance = SocketService.connect(user._id, user.role);
  //     setSocket(socketInstance);
  //     socketInstance.on("receiveOrderNotification", (notification) => {
  //       console.log("order recived-->", notification);
  //       dispatch(addNotification(notification.order)); // Dispatch the notification to Redux store
  //     });

  //     // Disconnect socket on component unmount
  //     // return () => {
  //     //   SocketService.disconnect();
  //     // };
  //   }
  // }, [user, dispatch]);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Sidebar with transition */}
      <div
        className={`fixed top-0 h-screen bg-slate-50 z-10 overflow-y-auto transform transition-transform duration-300 ease-in-out
        ${showSidebar ? "left-0 w-[270px]" : "left-[-270px]"}`}
      >
        <SideNav showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      </div>

      {/* Header */}
      <div
        className={`transition-all duration-300 bg-slate-800 ease-in-out px-5 py-2
        ${showSidebar ? "lg:ml-[270px] " : "lg:ml-0"}`}
      >
        <Header showSidebar={showSidebar} setShowSidebar={setShowSidebar} />
      </div>

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out px-5 py-2 overflow-y-auto
        ${showSidebar ? "lg:ml-[270px]" : "lg:ml-0 "}`}
      >
        <Outlet context={{ socket }} />
      </div>
    </div>
  );
}
