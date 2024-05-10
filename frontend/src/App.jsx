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
import Fleet from "./pages/Fleet";
import Sidebar from "./components/Sidebar";
import Gmap from "./pages/Gmap";
import Contractors from "./pages/Contractors";
import Plans from "./pages/Plans";
import Employee from "./pages/Employee";
import Garbage from "./pages/Garbage";

const App = () => {
  return (
    <div className="App font-body" id="outer-container">
      <div id="page-wrap">
        <GlobalStateProvider>
          <BrowserRouter>
            <Sidebar id="sidebar" />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route
                path="/auth/change-password"
                element={<ChangePassword />}
              />
              <Route path="/users" element={<Users />} />
              <Route path="/roles" element={<Roles />} />
              <Route path="/vehicles" element={<Vehicles />} />
              <Route path="/sts" element={<STS />} />
              <Route path="/landfills" element={<Landfills />} />
              <Route path="/contractors" element={<Contractors />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/employees" element={<Employee />} />
              <Route path="/garbage" element={<Garbage />} />
              <Route path="/transfer/sts" element={<TransferSTS />} />
              <Route path="/transfer/landfill" element={<TransferLandfill />} />
              <Route path="/transfer/fleet" element={<Fleet />} />
            </Routes>
          </BrowserRouter>
        </GlobalStateProvider>
      </div>
    </div>
  );
};

export default App;
