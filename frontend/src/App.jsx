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
              <Route path="/transfer/sts" element={<TransferSTS />} />
              <Route path="/transfer/landfill" element={<TransferLandfill />} />
              <Route path="/transfer/fleet" element={<Fleet />} />
              <Route
                path="/map"
                element={
                  <Gmap
                    height={800}
                    width={1000}
                    origin={{
                      lat: 23.757985271113462,
                      lng: 90.38987643530105,
                    }}
                    destination={{
                      lat: 23.72274789134823,
                      lng: 90.39988172573108,
                    }}
                    zoom={14}
                    travelMode="Driving"
                  />
                }
              />
            </Routes>
          </BrowserRouter>
        </GlobalStateProvider>
      </div>
    </div>
  );
};

export default App;
