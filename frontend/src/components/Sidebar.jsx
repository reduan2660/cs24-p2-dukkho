import React from "react";
import { slide as Menu } from "react-burger-menu";
import "../index.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Modal } from "antd";
import api from "../api";
import { useGlobalState } from "../GlobalStateProvider";

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
        <div onClick={() => to("")} className="menu-item -mt-8">
          Dashboard
        </div>
        <div className="-mb-8 text-sm">User Management</div>
        {globalState.user?.role.permissions.includes("list_all_users") && (
          <div onClick={() => to("users")} className="menu-item -mt-8">
            Users
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_all_roles") && (
          <div onClick={() => to("roles")} className="menu-item -mt-8">
            Roles & Permissions
          </div>
        )}
        <div className="-mb-8 text-sm">Waste Management</div>
        {globalState.user?.role.permissions.includes("list_all_sts") && (
          <div onClick={() => to("sts")} className="menu-item -mt-8">
            STS
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_landfill") && (
          <div onClick={() => to("landfills")} className="menu-item -mt-8">
            Landfills
          </div>
        )}
        {globalState.user?.role.permissions.includes("list_vehicle") && (
          <div onClick={() => to("vehicles")} className="menu-item -mt-8">
            Vehicles
          </div>
        )}
        <div className="-mb-8 text-sm">Waste Management</div>
        {globalState.user?.role.permissions.includes("view_transfer") && (
          <div
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
            className="menu-item -mt-8"
          >
            Transfer Records
          </div>
        )}
        <div onClick={() => to("transfer/fleet")} className="menu-item -mt-8">
          Fleet Planning
        </div>
        <div className="-mb-8 text-sm">Account</div>
        <div
          onClick={() => to("auth/change-password")}
          className="menu-item -mt-8"
        >
          Change Password
        </div>
        {isLoggedIn ? (
          <li>
            <div
              onClick={() => {
                setLogoutModal(true);
                setOpen(false);
              }}
              className="menu-item"
            >
              Logout
            </div>
          </li>
        ) : (
          <li>
            <div onClick={() => to("login")} className="menu-item">
              Login
            </div>
          </li>
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
