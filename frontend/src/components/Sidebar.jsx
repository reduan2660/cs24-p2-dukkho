import { slide as Menu } from "react-burger-menu";
import "../index.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Modal } from "antd";
import api from "../api";
import { useGlobalState } from "../GlobalStateProvider";
import { GoGraph } from "react-icons/go";
import { FaRegNewspaper } from "react-icons/fa6";
import { PiBuildings, PiUsersThree } from "react-icons/pi";
import { CiTrash } from "react-icons/ci";
import { GrPlan } from "react-icons/gr";
import {
  RiKeyLine,
  RiShieldKeyholeLine,
  RiHomeOfficeLine,
} from "react-icons/ri";
import { FaTruck, FaUsers } from "react-icons/fa";
import { LiaDumpsterSolid } from "react-icons/lia";
import { BiTransfer } from "react-icons/bi";
import { MdEmojiTransportation, MdLogin, MdLogout } from "react-icons/md";

const Sidebar = () => {
  const navigate = useNavigate();
  let location = useLocation();
  const [logoutModal, setLogoutModal] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setOpen] = useState(false);

  const to = (address) => {
    setOpen(false);
    navigate(`/${address}`);
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
        navigate("/login", { state: "session expired" });
      }
    };

    checkCookie();
  }, []);

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

  const logout = () => {
    api
      .get("/auth/logout")
      .then((res) => {
        if (res.status === 200) {
          navigate("/login", { state: "logout" });
          setLogoutModal(false);
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 401) {
          navigate("/login", { state: "session expired" });
        }
        setLogoutModal(false);
      });
  };

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <div
      className={`${
        location.pathname === "/auth/reset-password" ||
        location.pathname === "/auth/change-password" ||
        location.pathname === "/login" ||
        location.pathname === "*"
          ? "hideButton"
          : ""
      }`}
    >
      <Menu
        right
        isOpen={isOpen}
        onOpen={() => setOpen(!isOpen)}
        onClose={() => setOpen(!isOpen)}
      >
        <div className="-mb-8 text-sm">Main</div>
        <div className="menu-item -mt-8">
          <GoGraph className="text-xgray" />
          <div onClick={() => to("")} className="ml-2">
            Dashboard
          </div>
        </div>
        {(globalState.user?.role.permissions.includes("list_all_users") ||
          globalState.user?.role.permissions.includes("list_all_roles")) && (
          <div className="-mb-8 text-sm">User Management</div>
        )}

        {globalState.user?.role.permissions.includes("list_all_users") && (
          <div className="menu-item -mt-8">
            <PiUsersThree className="text-xgray" />
            <div onClick={() => to("users")} className="ml-2">
              Users
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_all_roles") && (
          <div className="menu-item -mt-8">
            <RiShieldKeyholeLine className="text-xgray" />
            <div onClick={() => to("roles")} className="ml-2">
              Roles & Permissions
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_all_sts") ||
        globalState.user?.role.permissions.includes("list_landfill") ||
        globalState.user?.role.permissions.includes("list_contract") ||
        globalState.user?.role.permissions.includes("list_plan") ||
        globalState.user?.role.permissions.includes("list_vehicle") ||
        globalState.user?.role.permissions.includes("list_employee") ||
        globalState.user?.role.permissions.includes("schedule") ? (
          <div className="-mb-8 text-sm">Waste Management</div>
        ) : null}
        {globalState.user?.role.permissions.includes("list_all_sts") && (
          <div className="menu-item -mt-8">
            <PiBuildings className="text-xgray" />
            <div onClick={() => to("sts")} className="ml-2">
              STS
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_landfill") && (
          <div className="menu-item -mt-8">
            <LiaDumpsterSolid className="text-xgray" />
            <div onClick={() => to("landfills")} className="ml-2">
              Landfills
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_vehicle") && (
          <div className="menu-item -mt-8">
            <FaTruck className="text-xgray" />
            <div onClick={() => to("vehicles")} className="ml-2">
              Vehicles
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_contract") && (
          <div className="menu-item -mt-8">
            <RiHomeOfficeLine className="text-xgray" />
            <div onClick={() => to("contractors")} className="ml-2">
              Contractors
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_employee") && (
          <div className="menu-item -mt-8">
            <FaUsers className="text-xgray" />
            <div onClick={() => to("employees")} className="ml-2">
              Employees
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_plan") && (
          <div className="menu-item -mt-8">
            <FaRegNewspaper className="text-xgray" />
            <div onClick={() => to("plans")} className="ml-2">
              Collection Plans
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("view_collection") && (
          <div className="menu-item -mt-8">
            <CiTrash className="text-xgray" />
            <div onClick={() => to("garbage")} className="ml-2">
              Garbage Collection
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("schedule") && (
          <div className="menu-item -mt-8">
            <GrPlan className="text-xgray" />
            <div onClick={() => to("schedule")} className="ml-2">
              Schedule Planning
            </div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("view_transfer") ||
        globalState.user?.role.permissions.includes("update_transfer_sts") ||
        globalState.user?.role.permissions.includes("get_fleet_planning") ? (
          <div className="-mb-8 text-sm">Waste Record</div>
        ) : null}

        {globalState.user?.role.permissions.includes("view_transfer") && (
          <div
            className="menu-item -mt-8"
            onClick={() =>
              globalState.user?.role.permissions.includes(
                "update_transfer_sts",
              ) || globalState.user?.role.permissions.includes("view_transfer")
                ? to("transfer/sts")
                : globalState.user?.role.permissions.includes(
                      "update_transfer_landfill",
                    )
                  ? to("transfer/landfills")
                  : null
            }
          >
            <BiTransfer className="text-xgray" />
            <div className="ml-2">Transfer Records</div>
          </div>
        )}
        {globalState.user?.role.permissions.includes("get_fleet_planning") && (
          <div className="menu-item -mt-8">
            <MdEmojiTransportation className="text-xgray" />
            <div onClick={() => to("transfer/fleet")} className="ml-2">
              Fleet Planning
            </div>
          </div>
        )}
        <div className="-mb-8 text-sm">Account</div>
        <div className="menu-item -mt-8">
          <RiKeyLine className="text-xgray" />
          <div onClick={() => to("auth/change-password")} className="ml-2">
            Change Password
          </div>
        </div>
        {isLoggedIn ? (
          <div
            className="menu-item -mt-8"
            onClick={() => {
              setLogoutModal(true);
              setOpen(false);
            }}
          >
            <MdLogout className="text-xgray" />
            <div onClick={() => to("")} className="ml-2">
              Logout
            </div>
          </div>
        ) : (
          <div className="menu-item -mt-8">
            <MdLogin className="text-xgray" />
            <div onClick={() => to("login")} className="ml-2">
              Login
            </div>
          </div>
        )}
        <Modal
          title="Confirmation"
          style={{ top: 350 }}
          open={logoutModal}
          okText={"Log out"}
          onOk={logout}
          onCancel={() => setLogoutModal(false)}
        >
          <div>Are you sure you want to log out?</div>
        </Modal>
      </Menu>
    </div>
  );
};

export default Sidebar;
