import AuthContainer from "@/components/layouts/AuthContainer";
import MainContainer from "@/components/layouts/MainContainer";
import menuItems from "@/config/menuItem";
import { loginSuccess } from "@/features/auth/authSlice";
import AdminLogin from "@/pages/auth/AdminLogin";
import AdminRegister from "@/pages/auth/AdminRegister";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import App from "../App.jsx"; // Import App.jsx

export default function AppRoutes() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isTokenSet, setIsTokenSet] = useState(false);

  useEffect(() => {
    console.log("approutes called");
    const checkAuthTokens = async () => {
      setIsTokenSet(true);
      const accessToken = await localStorage.getItem("accessToken");
      const refreshToken = await localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        if (!location.pathname.startsWith("/auth")) {
          navigate("/auth");
        }
      } else {
        dispatch(loginSuccess({ accessToken, refreshToken }));
        if (location.pathname.startsWith("/auth")) {
          navigate("/dashboard");
        }
      }
      setIsTokenSet(false);
    };

    checkAuthTokens();
  }, [dispatch]);

  if (isTokenSet) {
    return null;
  }

  return (
    <Routes>
      {/* Redirect from / to /dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Auth routes */}
      <Route path="/auth" element={<AuthContainer />}>
        <Route path="" element={<Navigate to="login" />} />
        <Route path="login" element={<AdminLogin />} />
        <Route path="register" element={<AdminRegister />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={<MainContainer />}>
        
        {menuItems.map((menuItem) =>
          menuItem.subMenuItems ? (
            <Route
              key={menuItem.href}
              path={menuItem.href}
              element={menuItem.component}
            >
              {menuItem.subMenuItems.map((subMenuItem) => (
                <Route
                  key={subMenuItem.href}
                  path={subMenuItem.href}
                  element={subMenuItem.component}
                />
              ))}
            </Route>
          ) : (
            <Route
              key={menuItem.href}
              path={menuItem.href}
              element={menuItem.component}
            />
          )
        )}
      </Route>
    </Routes>
  );
}