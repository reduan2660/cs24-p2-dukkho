import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BiSolidLeaf } from "react-icons/bi";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      changePassword();
    }
  };

  const changePassword = () => {
    api
      .post("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      })
      .then((res) => {
        if (res.status === 200) {
          navigate("/login", {
            state: "password_changed",
          });
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

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
          Update Password
        </p>
        <p className="lg:text-md text-sm text-xgray">
          Enter previous password for verification
        </p>
      </div>
      <div className="flex w-[360px] flex-col gap-y-8 lg:w-[400px]">
        <div className="flex flex-col gap-y-6">
          <input
            type="password"
            placeholder="Old Password"
            className="w-full rounded-md border border-[#DED2D9] px-2 py-3 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
            onChange={(e) => setOldPassword(e.target.value)}
          />
          <div className="flex flex-col gap-y-2">
            <input
              type="password"
              placeholder="New Password"
              className="w-full rounded-md border border-[#DED2D9] px-2 py-3 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
              onChange={(e) => setNewPassword(e.target.value)}
              onKeyDown={handleKeyPress}
            />
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={changePassword}
            className="w-full rounded-md bg-xblue p-3 text-lg font-medium text-white hover:bg-blue-600"
          >
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
