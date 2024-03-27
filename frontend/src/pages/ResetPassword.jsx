import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiSolidLeaf } from "react-icons/bi";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      SubmitEmail();
    }
  };

  const handleKeyPressReset = (event) => {
    if (event.key === "Enter") {
      Reset();
    }
  };

  const Reset = () => {
    api
      .post("/auth/reset-password/confirm", {
        email: email,
        token: "1234",
        new_password: password,
      })
      .then((res) => {
        if (res.status === 200) {
          navigate("/login", { state: "reset_password" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const SubmitEmail = () => {
    api
      .post("/auth/reset-password/initiate", {
        email: email,
      })
      .then((res) => {
        if (res.status === 200) {
          setToken("token");
          toast.success("Token sent to email");
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-y-8">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={false}
        theme="colored"
      />
      <div className="fixed top-8 flex items-center gap-x-4 lg:top-16">
        <BiSolidLeaf className="text-5xl text-green-600" />
        <p className="text-3xl font-bold text-xdark lg:text-5xl">EcoSync</p>
      </div>
      {token === "" ? (
        <div className="flex flex-col items-center gap-y-2">
          <p className="text-3xl font-black text-xgray lg:text-4xl">
            Reset Password
          </p>
          <p className="lg:text-md text-sm text-xgray">
            Enter your email to continue
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-y-2">
          <p className="text-3xl font-black text-xgray lg:text-4xl">
            Reset Password
          </p>
          <p className="lg:text-md text-sm text-xgray">Enter new password</p>
        </div>
      )}
      {token === "" ? (
        <div className="flex w-[360px] flex-col gap-y-8 lg:w-[400px]">
          <div className="flex flex-col gap-y-6">
            <div className="flex flex-col gap-y-2">
              <input
                type="email"
                placeholder="Email"
                className="w-full rounded-md border border-[#DED2D9] px-2 py-3 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyPress}
              />
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={SubmitEmail}
              className="w-full rounded-md bg-xblue p-3 text-lg font-medium text-white hover:bg-blue-600"
            >
              Submit
            </button>
          </div>
        </div>
      ) : (
        <div className="flex w-[360px] flex-col gap-y-8 lg:w-[400px]">
          <div className="flex flex-col gap-y-6">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-md border border-[#DED2D9] px-2 py-3 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="number"
              placeholder="Token"
              className="w-full rounded-md border border-[#DED2D9] px-2 py-3 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
            />
            <div className="flex flex-col gap-y-2">
              <input
                type="password"
                placeholder="New Password"
                className="w-full rounded-md border border-[#DED2D9] px-2 py-3 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPressReset}
              />
            </div>
          </div>
          <div>
            <button
              type="button"
              onClick={Reset}
              className="w-full rounded-md bg-xblue p-3 text-lg font-medium text-white hover:bg-blue-600"
            >
              Reset Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
