import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiSolidLeaf } from "react-icons/bi";
import api from "../api";
import { useGlobalState } from "../GlobalStateProvider";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { globalState, setGlobalState } = useGlobalState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      login();
    }
  };

  const login = () => {
    api
      .post("/auth/login", {
        email: email,
        password: password,
      })
      .then((res) => {
        if (res.status === 200) {
          navigate("/");
          setGlobalState((prevState) => ({
            ...prevState,
            user: res.data,
          }));
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          toast.error(err.response.data?.message);
        }
      });
  };

  useEffect(() => {
    if (state === "password_changed")
      toast.success("Password changed successfully");
    else if (state === "reset_password")
      toast.success("Password has been reset successfully");
    else if (state === "logout") toast.success("Logged out successfully");
    else if (state === "session expired")
      toast.error("Session Expired. Please login again to continue");
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-y-8">
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        draggable={true}
        pauseOnHover={false}
        theme="colored"
      />
      <div className="fixed top-8 flex items-center gap-x-4 lg:top-16">
        <BiSolidLeaf className="text-5xl text-green-600" />
        <p className="text-3xl font-bold text-xdark lg:text-5xl">EcoSync</p>
      </div>
      <div className="flex flex-col items-center gap-y-2">
        <p className="text-3xl font-black text-xgray lg:text-4xl">
          Login to your account
        </p>
        <p className="lg:text-md text-sm text-xgray">
          Together, let&apos;s build a cleaner, greener future.
        </p>
      </div>
      <div className="flex w-[360px] flex-col gap-y-8 lg:w-[400px]">
        <div className="flex flex-col gap-y-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-md border border-[#DED2D9] px-2 py-3 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex flex-col gap-y-2">
            <input
              type="password"
              placeholder="Password"
              className="w-full rounded-md border border-[#DED2D9] px-2 py-3 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <div className="flex justify-end">
              <button
                onClick={() => navigate("/auth/reset-password")}
                className="text-sm font-medium text-xblue"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={login}
            className="w-full rounded-md bg-xblue p-3 text-lg font-medium text-white hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
