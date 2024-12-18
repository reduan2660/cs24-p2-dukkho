import { useEffect, useState } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { IoChevronForwardOutline } from "react-icons/io5";
import { BiSolidLeaf } from "react-icons/bi";
import { GoGraph } from "react-icons/go";
import { PiUsersThree, PiBuildings } from "react-icons/pi";
import { FaTruck, FaUsers } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { MdLogout, MdLogin } from "react-icons/md";
import { FaRegNewspaper } from "react-icons/fa6";
import { CiTrash } from "react-icons/ci";
import { GrPlan } from "react-icons/gr";
import {
  RiShieldKeyholeLine,
  RiKeyLine,
  RiHomeOfficeLine,
} from "react-icons/ri";
import { LiaDumpsterSolid } from "react-icons/lia";
import api from "../api";
import { useGlobalState } from "../GlobalStateProvider";
import { BiTransfer } from "react-icons/bi";
import { MdEmojiTransportation } from "react-icons/md";

const SidePanel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
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
        if (err.response.status === 401) {
          navigate("/login", { state: "session expired" });
        }
      });
  };

  const getProfile = () => {
    api
      .get("/auth/me")
      .then((res) => {
        if (res.status === 200) {
          setGlobalState((prevState) => ({
            ...prevState,
            user: res.data,
          }));
        }
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate("/login", { state: "session expired" });
        }
      });
  };

  useEffect(() => {
    getProfile();
    const checkCookie = () => {
      const cookies = document.cookie.split("; ");
      const sessionCookie = cookies.find((cookie) =>
        cookie.startsWith("SESSION="),
      );
      if (sessionCookie) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
        navigate("/login", { state: "session expired" });
      }
    };

    checkCookie();
  }, []);

  return (
    <div className="sticky top-0 hidden h-screen lg:block">
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
          {collapsed ? (
            <FiUser className="text-md my-3 w-full text-center text-xgray" />
          ) : (
            <div>
              <div className="ml-5 mt-3 flex items-center gap-x-2">
                <FiUser className="text-md text-xgray" />
                <div className="text-md font-medium text-xgray">
                  {globalState.user?.name || "User"}
                </div>
              </div>
              <div className="mb-3 ml-5 text-xs font-thin text-xlightgray">
                {globalState.user?.role.name || "Role"}
              </div>
            </div>
          )}
          <hr />
          {!collapsed && (
            <div className="text-md ml-5 mt-7 font-medium text-xlightgray">
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
          {(globalState.user?.role.permissions.includes("list_all_users") ||
            globalState.user?.role.permissions.includes("list_all_roles")) &&
            !collapsed && (
              <SubMenu
                label="User Management"
                className="text-md mt-7 font-medium text-xlightgray"
              >
                {globalState.user?.role.permissions.includes(
                  "list_all_users",
                ) && (
                  <div
                    className={`w-full ${
                      location.pathname === "/users" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/users") navigate("/users");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem
                      icon={<PiUsersThree className="text-lg text-xgray" />}
                    >
                      <div className="font-medium text-xgray">Users</div>
                    </MenuItem>
                  </div>
                )}
                {globalState.user?.role.permissions.includes(
                  "list_all_roles",
                ) && (
                  <div
                    className={`w-full ${
                      location.pathname === "/roles" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/roles") navigate("/roles");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem
                      icon={<RiShieldKeyholeLine className="text-xgray" />}
                    >
                      <div className="font-medium text-xgray">
                        Roles & Permissions
                      </div>
                    </MenuItem>
                  </div>
                )}
              </SubMenu>
            )}

          {(globalState.user?.role.permissions.includes("list_vehicle") ||
            globalState.user?.role.permissions.includes("list_all_sts") ||
            globalState.user?.role.permissions.includes("list_landfill") ||
            globalState.user?.role.permissions.includes("list_contract") ||
            globalState.user?.role.permissions.includes("list_plan") ||
            globalState.user?.role.permissions.includes("list_employee") ||
            globalState.user?.role.permissions.includes("schedule")) &&
            !collapsed && (
              <SubMenu
                label="Waste Management"
                className="text-md mt-7 font-medium text-xlightgray"
              >
                {globalState.user?.role.permissions.includes(
                  "list_all_sts",
                ) && (
                  <div
                    className={`w-full ${
                      location.pathname === "/sts" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/sts") navigate("/sts");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem icon={<PiBuildings className="text-xgray" />}>
                      <div className="font-medium text-xgray">STS</div>
                    </MenuItem>
                  </div>
                )}
                {globalState.user?.role.permissions.includes(
                  "list_landfill",
                ) && (
                  <div
                    className={`w-full ${
                      location.pathname === "/landfills" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/landfills")
                        navigate("/landfills");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem
                      icon={<LiaDumpsterSolid className="text-xgray" />}
                    >
                      <div className="font-medium text-xgray">Landfills</div>
                    </MenuItem>
                  </div>
                )}
                {globalState.user?.role.permissions.includes(
                  "list_vehicle",
                ) && (
                  <div
                    className={`w-full ${
                      location.pathname === "/vehicles" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/vehicles")
                        navigate("/vehicles");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem icon={<FaTruck className="text-xgray" />}>
                      <div className="font-medium text-xgray">Vehicles</div>
                    </MenuItem>
                  </div>
                )}
                {globalState.user?.role.permissions.includes(
                  "list_contract",
                ) && (
                  <div
                    className={`w-full ${
                      location.pathname === "/contractors" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/contractors")
                        navigate("/contractors");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem
                      icon={<RiHomeOfficeLine className="text-xgray" />}
                    >
                      <div className="font-medium text-xgray">Contractors</div>
                    </MenuItem>
                  </div>
                )}
                {globalState.user?.role.permissions.includes(
                  "list_employee",
                ) && (
                  <div
                    className={`w-full ${
                      location.pathname === "/employees" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/employees")
                        navigate("/employees");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem icon={<FaUsers className="text-xgray" />}>
                      <div className="font-medium text-xgray">Employees</div>
                    </MenuItem>
                  </div>
                )}
                {globalState.user?.role.permissions.includes("list_plan") && (
                  <div
                    className={`w-full ${
                      location.pathname === "/plans" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/plans") navigate("/plans");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem icon={<FaRegNewspaper className="text-xgray" />}>
                      <div className="font-medium text-xgray">
                        Collection Plans
                      </div>
                    </MenuItem>
                  </div>
                )}
                {globalState.user?.role.permissions.includes("view_collection") && (
                  <div
                    className={`w-full ${
                      location.pathname === "/garbage" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/garbage") navigate("/garbage");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem icon={<CiTrash className="text-xgray" />}>
                      <div className="font-medium text-xgray">
                        Garbage Collection
                      </div>
                    </MenuItem>
                  </div>
                )}
                {globalState.user?.role.permissions.includes("schedule") && (
                  <div
                    className={`w-full ${
                      location.pathname === "/schedule" ? "bg-blue-100" : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/schedule") navigate("/schedule");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem icon={<GrPlan className="text-xgray" />}>
                      <div className="font-medium text-xgray">
                        Schedule Planning
                      </div>
                    </MenuItem>
                  </div>
                )}
              </SubMenu>
            )}

          {globalState.user?.role.permissions.includes("view_transfer") &&
            !collapsed && (
              <SubMenu
                label="Waste Records"
                className="text-md mt-7 font-medium text-xlightgray"
              >
                {globalState.user?.role.permissions.includes("view_transfer") &&
                  (globalState.user?.role.permissions.includes(
                    "update_transfer_sts",
                  ) ? (
                    <div
                      className={`w-full ${
                        location.pathname === "/transfer/sts"
                          ? "bg-blue-100"
                          : ""
                      }`}
                      onClick={() => {
                        if (location.pathname !== "/transfer/sts")
                          navigate("/transfer/sts");
                        else setCollapsed(!collapsed);
                      }}
                    >
                      <MenuItem icon={<BiTransfer className="text-xgray" />}>
                        <div className="font-medium text-xgray">
                          Transfer Records
                        </div>
                      </MenuItem>
                    </div>
                  ) : globalState.user?.role.permissions.includes(
                      "update_transfer_landfill",
                    ) ? (
                    <div
                      className={`w-full ${
                        location.pathname === "/transfer/landfill"
                          ? "bg-blue-100"
                          : ""
                      }`}
                      onClick={() => {
                        if (location.pathname !== "/transfer/landfill")
                          navigate("/transfer/landfill");
                        else setCollapsed(!collapsed);
                      }}
                    >
                      <MenuItem icon={<BiTransfer className="text-xgray" />}>
                        <div className="font-medium text-xgray">
                          Transfer Records
                        </div>
                      </MenuItem>
                    </div>
                  ) : globalState.user?.role.permissions.includes(
                      "view_transfer",
                    ) ? (
                    <div
                      className={`w-full ${
                        location.pathname === "/transfer/sts"
                          ? "bg-blue-100"
                          : ""
                      }`}
                      onClick={() => {
                        if (location.pathname !== "/transfer/sts")
                          navigate("/transfer/sts");
                        else setCollapsed(!collapsed);
                      }}
                    >
                      <MenuItem icon={<BiTransfer className="text-xgray" />}>
                        <div className="font-medium text-xgray">
                          Transfer Records
                        </div>
                      </MenuItem>
                    </div>
                  ) : (
                    <div></div>
                  ))}
                {globalState.user?.role.permissions.includes(
                  "get_fleet_planning",
                ) && (
                  <div
                    className={`w-full ${
                      location.pathname === "/transfer/fleet"
                        ? "bg-blue-100"
                        : ""
                    }`}
                    onClick={() => {
                      if (location.pathname !== "/transfer/fleet")
                        navigate("/transfer/fleet");
                      else setCollapsed(!collapsed);
                    }}
                  >
                    <MenuItem
                      icon={<MdEmojiTransportation className="text-xgray" />}
                    >
                      <div className="font-medium text-xgray">
                        Fleet Planning
                      </div>
                    </MenuItem>
                  </div>
                )}
              </SubMenu>
            )}

          {!collapsed && (
            <div className="text-md ml-5 mt-7 font-medium text-xlightgray">
              Account
            </div>
          )}
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
