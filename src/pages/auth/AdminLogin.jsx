import React, { useState } from "react";
import {
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { host } from "@/api/config";
import { getErrorMessage } from "@/utility/getErrorMessage";
import { loginSuccess } from "@/features/auth/authSlice";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const login = async () => {
    if (mobileNumber.length < 10) {
      toast.warn("Mobile number should be 10 digits");
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.post(
        `${host}/api/v1/users/auth/admin-login`,
        {
          mobileNo: mobileNumber,
          password,
        }
      );
      const { accessToken, refreshToken } = response.data.data;
      console.log(accessToken, refreshToken);
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      dispatch(loginSuccess(accessToken, refreshToken));
      navigate("/");
    } catch (error) {
      console.log("Error while login Admin: ", error);
      const { message } = getErrorMessage(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-[80%] border-none mt-5">
      <CardHeader>
        <CardTitle className="w-full flex justify-center">
          <h1 className="text-center text-lg font-bold">
            Login with your credentials
          </h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input
            id="mobileNumber"
            value={mobileNumber}
            type="tel"
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="Enter your mobile number"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Enter password"
          />
        </div>
      </CardContent>
      <CardFooter className="flex-col">
        {isLoading ? (
          <Button className="w-full" disabled>
            <Loader2 className="animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button onClick={login} className="w-full">
            Login
          </Button>
        )}
      </CardFooter>
    </div>
  );
}
