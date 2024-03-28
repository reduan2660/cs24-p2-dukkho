import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Users from "./pages/Users";
import { GlobalStateProvider } from "./GlobalStateProvider";
import Roles from "./pages/Roles";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Vehicles from "./pages/Vehicles";
import STS from "./pages/STS";

const App = () => {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/change-password" element={<ChangePassword />} />
          <Route path="/admin/users" element={<Users />} />
          <Route path="/admin/roles" element={<Roles />} />
          <Route path="/admin/vehicles" element={<Vehicles />} />
          <Route path="/admin/sts" element={<STS />} />
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
};

export default App;
