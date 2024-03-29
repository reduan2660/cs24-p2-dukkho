import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Users from "./pages/Users";
import { GlobalStateProvider } from "./GlobalStateProvider";
import Roles from "./pages/Roles";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import Vehicles from "./pages/Vehicles";
import STS from "./pages/STS";
import Landfills from "./pages/Landfills";
import TransferSTS from "./pages/TransferSTS";
import TransferLandfill from "./pages/TransferLandfill";
import Dashboard from "./pages/Dashboard";

const App = () => {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/change-password" element={<ChangePassword />} />
          <Route path="/users" element={<Users />} />
          <Route path="/roles" element={<Roles />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/sts" element={<STS />} />
          <Route path="/landfills" element={<Landfills />} />
          <Route path="/transfer/sts" element={<TransferSTS />} />
          <Route path="/transfer/landfill" element={<TransferLandfill />} />
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
};

export default App;
