import React, { useEffect } from "react";
import SidePanel from "../components/SidePanel";
import api from "../api";

const Users = () => {
  const getUsers = () => {
    api.get("/users").then((res) => console.log(res.data));
  };

  useEffect(() => {
    getUsers();
  }, []);
  return (
    <div className="min-h-screen">
      <div className="relative flex flex-1">
        {" "}
        <SidePanel />
      </div>
    </div>
  );
};

export default Users;
