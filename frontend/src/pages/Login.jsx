import { useState } from "react";
import auth from "../auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = () => {
    auth
      .post("/login", {
        email: email,
        password: password,
      })
      .then((res) => {
        console.log(res.data);
      });
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen gap-y-8">
      <div className="flex items-center gap-x-4 fixed top-16">
        <img src="src/assets/logo.png" width={60} height={60} />
        <p className="text-5xl font-bold text-xdark">EcoSync</p>
      </div>
      <div className="flex flex-col items-center gap-y-2">
        <p className="text-4xl font-black text-xgray">Login to your account</p>
        <p className="text-md text-xgray">
          Together, let&apos;s build a cleaner, greener future.
        </p>
      </div>
      <div className="flex flex-col gap-y-8">
        <div className="flex flex-col gap-y-6">
          <input
            type="email"
            placeholder="Email"
            className="border border-[#DED2D9] rounded-md px-2 py-3 w-[400px] focus:outline-none focus:ring-1 focus:ring-xblue focus:border-transparent"
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="flex flex-col gap-y-2">
            <input
              type="password"
              placeholder="Password"
              className="border border-[#DED2D9] rounded-md px-2 py-3 w-[400px] focus:outline-none focus:ring-1 focus:ring-xblue focus:border-transparent"
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex justify-end">
              <button className="text-xblue text-sm font-medium">
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
        <div>
          <button
            type="button"
            onClick={login}
            className="w-full bg-xblue p-3 rounded-md text-white text-lg font-medium hover:bg-blue-600"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
