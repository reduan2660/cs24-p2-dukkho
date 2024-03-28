import React, { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { IoChevronForwardOutline } from "react-icons/io5";
import { BiSolidLeaf } from "react-icons/bi";
import { GoGraph } from "react-icons/go";
import { PiUsersThree, PiBuildings } from "react-icons/pi";
import { FaTruck } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { BsTools } from "react-icons/bs";
import { MdLogout, MdLogin } from "react-icons/md";
import { RiShieldKeyholeLine, RiKeyLine } from "react-icons/ri";
import { LiaDumpsterSolid } from "react-icons/lia";
import api from "../api";

const SidePanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const logout = () => {
    api
      .get("/auth/logout")
      .then((res) => {
        if (res.status === 200) {
          navigate("/login", { state: "logout" });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const checkCookie = () => {
      const cookies = document.cookie.split("; ");
      const sessionCookie = cookies.find((cookie) =>
        cookie.startsWith("SESSION="),
      );
      if (sessionCookie) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    };

    checkCookie();
  }, []);

  return (
    <div className="hidden min-h-screen lg:block">
      <Sidebar collapsed={collapsed} className="h-full">
        <Menu>
          <MenuItem
            icon={
              collapsed ? (
                <IoChevronForwardOutline
                  className={`transition-all duration-300 ${
                    collapsed ? "rotate-0" : "rotate-180"
                  }`}
                />
              ) : (
                <BiSolidLeaf className="text-xl text-green-600" />
              )
            }
            onClick={() => {
              setCollapsed(!collapsed);
            }}
            className="py-3"
          >
            <div className="flex items-center">
              <div className="text-lg font-semibold text-xdark">EcoSync</div>
              <div
                className={`flex transition-all duration-300 justify-${
                  collapsed ? "center" : "end"
                } flex-1`}
              >
                <IoChevronForwardOutline
                  className={`transition-all duration-300 ${
                    collapsed ? "rotate-0" : "rotate-180"
                  }`}
                />
              </div>
            </div>
          </MenuItem>
          <hr />
          {!collapsed && (
            <div className="text-md ml-6 mt-7 font-medium text-xlightgray">
              Main
            </div>
          )}
          <div
            className={`w-full ${
              location.pathname === "/" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/") navigate("/");
            }}
          >
            <MenuItem icon={<GoGraph className="text-xgray" />}>
              <div className="font-medium text-xgray">Dashboard</div>
            </MenuItem>
          </div>
          <div
            className={`w-full ${
              location.pathname === "/admin/roles" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/roles")
                navigate("/admin/roles");
              else setCollapsed(!collapsed);
            }}
          >
            <MenuItem icon={<RiShieldKeyholeLine className="text-xgray" />}>
              <div className="font-medium text-xgray">Roles & Permissions</div>
            </MenuItem>
          </div>
          {!collapsed && (
            <div className="text-md ml-6 mt-7 font-medium text-xlightgray">
              Management
            </div>
          )}
          <div
            className={`w-full ${
              location.pathname === "/admin/users" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/users")
                navigate("/admin/users");
              else setCollapsed(!collapsed);
            }}
          >
            <MenuItem icon={<PiUsersThree className="text-lg text-xgray" />}>
              <div className="font-medium text-xgray">Users</div>
            </MenuItem>
          </div>
          <div
            className={`w-full ${
              location.pathname === "/admin/vehicles" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/vehicles")
                navigate("/admin/vehicles");
              else setCollapsed(!collapsed);
            }}
          >
            <MenuItem icon={<FaTruck className="text-xgray" />}>
              <div className="font-medium text-xgray">Vehicles</div>
            </MenuItem>
          </div>
          <div
            className={`w-full ${
              location.pathname === "/admin/sts" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/sts") navigate("/admin/sts");
              else setCollapsed(!collapsed);
            }}
          >
            <MenuItem icon={<PiBuildings className="text-xgray" />}>
              <div className="font-medium text-xgray">STS</div>
            </MenuItem>
          </div>
          <div
            className={`w-full ${
              location.pathname === "/admin/landfills" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/admin/landfills")
                navigate("/admin/landfills");
              else setCollapsed(!collapsed);
            }}
          >
            <MenuItem icon={<LiaDumpsterSolid className="text-xgray" />}>
              <div className="font-medium text-xgray">Landfills</div>
            </MenuItem>
          </div>
          {!collapsed && (
            <div className="text-md ml-6 mt-7 font-medium text-xlightgray">
              Settings
            </div>
          )}

          <div
            className={`w-full ${
              location.pathname === "/" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/") navigate("/");
            }}
          >
            <MenuItem icon={<FiUser className="text-lg text-xgray" />}>
              <div className="font-medium text-xgray">Account</div>
            </MenuItem>
          </div>
          <div
            className={`w-full ${
              location.pathname === "/" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/") navigate("/");
            }}
          >
            <MenuItem icon={<BsTools className="text-xgray" />}>
              <div className="font-medium text-xgray">Preferences</div>
            </MenuItem>
          </div>
          <div
            className={`w-full ${
              location.pathname === "/auth/change-password" ? "bg-blue-100" : ""
            }`}
            onClick={() => {
              if (location.pathname !== "/auth/change-password")
                navigate("/auth/change-password");
            }}
          >
            <MenuItem icon={<RiKeyLine className="text-lg text-xgray" />}>
              <div className="font-medium text-xgray">Change Password</div>
            </MenuItem>
          </div>
          {isLoggedIn ? (
            <div className={`absolute bottom-0 w-full`} onClick={logout}>
              <hr />
              <MenuItem
                icon={<MdLogout className="text-xgray" />}
                className="py-3"
              >
                <div className="font-medium text-xgray">Logout</div>
              </MenuItem>
            </div>
          ) : (
            <div
              className={`absolute bottom-0 w-full`}
              onClick={() => navigate("/login")}
            >
              <hr />
              <MenuItem
                icon={<MdLogin className="text-xgray" />}
                className="py-3"
              >
                <div className="font-medium text-xgray">Login</div>
              </MenuItem>
            </div>
          )}
        </Menu>
      </Sidebar>
    </div>
  );
};

export default SidePanel;
