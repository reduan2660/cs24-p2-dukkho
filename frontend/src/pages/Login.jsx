import { useState } from "react";
import auth from "../auth";
import { useNavigate } from "react-router-dom";
import { BiSolidLeaf } from "react-icons/bi";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    auth
      .post("/login", {
        email: email,
        password: password,
      })
      .then((res) => {
        if (res.status === 200) navigate("/admin/users");
      });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-y-8">
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
            />
            <div className="flex justify-end">
              <button className="text-sm font-medium text-xblue">
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
