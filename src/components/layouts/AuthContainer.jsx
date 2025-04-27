import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "../ui/button";

export default function () {
  return (
    <div className="w-screen flex ">
      <div className="w-1/2 flex justify-center flex-col">
        <div className="w-full flex justify-center mt-10">
          <h1 className="text-2xl font-bold text-center">
            Register Today and Start Your Shopping Journey!
          </h1>
        </div>
        <div className="w-full flex justify-center mt-10 overflow-hidden">
          <img
            className="w-[400px] h-[350px] mr-10"
            src="/cartlogo.gif"
            alt=""
          />
        </div>
        <div className="w-full flex justify-center mt-10">
          <Link to={"/auth/register"}>
            <Button variant="link" className="mr-5">
              Register
            </Button>
          </Link>
          <Link to={"/auth/login"}>
            <Button variant="link" className="mr-5">
              Login
            </Button>
          </Link>
          <Link to={"/auth/admin-login"}>
            <Button variant="link" className="mr-5">
              Admin
            </Button>
          </Link>
        </div>
      </div>
      <div className="w-1/2 h-screen flex items-center justify-center rounded-l-lg shadow-lg p-6 bg-white">
        <Outlet />
      </div>
    </div>
  );
}
