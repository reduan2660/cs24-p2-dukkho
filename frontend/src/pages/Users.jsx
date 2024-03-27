import React, { useEffect, useRef, useState } from "react";
import SidePanel from "../components/SidePanel";
import api from "../api";
import { Button, Modal, Table } from "antd";
import Column from "antd/es/table/Column";
import Navbar from "../components/Navbar";
import { DownOutlined, SmileOutlined } from "@ant-design/icons";
import { Select } from "antd";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useGlobalState } from "../GlobalStateProvider";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [updateUser, setUpdateUser] = useState({});
  const [UpdateRole, setUpdateRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const { globalState } = useGlobalState();
  const [editingUserId, setEditingUserId] = useState(null);
  const nameInputRef = useRef(null);

  console.log(globalState);

  const showModal = () => {
    setEmail("");
    setName("");
    setPassword("");
    setOpenCreate(true);
  };

  const handleNameUpdate = (userId, newName) => {
    api
      .put(`/users/${userId}`, { name: newName })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Name updated successfully");
          getUsers();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error occurred while updating name");
      });
    setEditingUserId(null);
  };

  useEffect(() => {
    if (editingUserId !== null) {
      nameInputRef.current.focus();
    }
  }, [editingUserId]);

  const deleteModal = (id, name) => {
    setOpenDelete(true);
    setUpdateUser({ id: id, name: name });
  };

  const onChange = (id, name) => {
    setOpenConfirm(true);
    setUpdateUser({ id: id, name: name });
  };

  const ConfirmRole = () => {
    api
      .patch(`/users/${updateUser.id}`, {
        role_id: UpdateRole,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Role updated successfully");
          getUsers();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error occurred while updating role");
      })
      .finally(() => {
        setOpenConfirm(false);
      });
  };

  const filterOption = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  const CreateUser = () => {
    setConfirmLoading(true);
    api
      .post("/users", {
        name: name,
        email: email,
        password: password,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("User created successfully");
          getUsers();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error occurred while creating user");
      })
      .finally(() => {
        setOpenCreate(false);
        setConfirmLoading(false);
      });
  };

  const deleteUser = () => {
    api
      .delete(`/users/${updateUser.id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("User deleted successfully");
          getUsers();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error occurred while deleting user");
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(
        `selectedRowKeys: ${selectedRowKeys}`,
        "selectedRows: ",
        selectedRows,
      );
    },
    // getCheckboxProps: (record) => ({
    //   disabled: record.name === "Disabled User",
    //   // Column configuration not to be checked
    //   name: record.name,
    // }),
  };

  const getUsers = () => {
    api
      .get("/users")
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => setLoading(false));
  };

  const getRoles = () => {
    api
      .get("/rbac")
      .then((res) => setRoles(res.data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getRoles();
    getUsers();
  }, []);
  return (
    <div className="min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={false}
        theme="colored"
      />
      <div className="relative flex flex-1">
        <SidePanel />
        <div className="flex w-full flex-col">
          <Navbar />
          <div className="mx-2 mt-4 flex flex-col gap-y-4 lg:mx-16 lg:mt-16 lg:gap-y-12">
            <div className="mx-2 flex items-center justify-between">
              <div className="text-lg font-light text-xlightgray lg:text-3xl">
                All Users
              </div>
              <div>
                <button
                  type="button"
                  onClick={showModal}
                  className="rounded-md bg-xblue px-3 py-1 font-medium text-white hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                >
                  Create User
                </button>
              </div>
            </div>
            <div className=" overflow-x-auto">
              <Table
                loading={loading}
                dataSource={users}
                rowKey="id"
                style={{ overflowX: "auto" }}
                rowSelection={{
                  type: "checkbox",
                  ...rowSelection,
                }}
              >
                <Column
                  title="User ID"
                  dataIndex="id"
                  sorter={(a, b) => a.id - b.id}
                ></Column>
                <Column
                  title="Name"
                  dataIndex="name"
                  sorter={(a, b) => a.name.localeCompare(b.name)}
                  render={(name, record) => {
                    return editingUserId === record.id ? (
                      <input
                        type="text"
                        defaultValue={record.name}
                        ref={nameInputRef}
                        onBlur={(e) =>
                          handleNameUpdate(record.id, e.target.value)
                        }
                        className="w-fit rounded-md border border-[#DED2D9] px-1 py-0.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      />
                    ) : (
                      <div>{record.name}</div>
                    );
                  }}
                ></Column>
                <Column
                  title="Email"
                  dataIndex="email"
                  sorter={(a, b) => a.email.localeCompare(b.email)}
                ></Column>
                <Column
                  title="Role"
                  dataIndex="role"
                  render={(approved, record) => (
                    <div>
                      {globalState.user.role.permissions.includes(
                        "edit_role_permission",
                      ) ? (
                        <Select
                          showSearch
                          placeholder="Select a role"
                          variant="borderless"
                          defaultValue={record.role.name}
                          optionFilterProp="children"
                          onChange={() => onChange(record.id, record.name)}
                          onSelect={setUpdateRole}
                          filterOption={filterOption}
                          options={roles.map((role) => ({
                            value: role.id,
                            label: role.name,
                          }))}
                          className="w-full"
                        />
                      ) : (
                        <div>{record.role.name}</div>
                      )}
                    </div>
                  )}
                  sorter={(a, b) => a.role.name.localeCompare(b.role.name)}
                ></Column>
                <Column
                  title="Actions"
                  dataIndex="name"
                  render={(actions, record) => (
                    <div className="flex items-center gap-x-4">
                      <button
                        onClick={() => setEditingUserId(record.id)}
                        className="rounded-md bg-xblue px-4 py-1 text-sm font-medium text-white hover:bg-blue-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteModal(record.id, record.name)}
                        className="rounded-md bg-xred px-4 py-1 text-sm font-medium text-white hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                ></Column>
              </Table>
              <Modal
                title="Update Role"
                open={openConfirm}
                onOk={ConfirmRole}
                okText="Confirm"
                onCancel={() => setOpenConfirm(false)}
                centered
              >
                <div className="mx-2 my-4">
                  Are you sure you want to update the role for{" "}
                  <p className="inline font-semibold">{updateUser.name}</p>?
                </div>
              </Modal>
              <Modal
                title="Delete User"
                open={openDelete}
                onOk={deleteUser}
                okText="Delete"
                onCancel={() => setOpenDelete(false)}
                centered
              >
                <div className="mx-2 my-4">
                  Are you sure you want to delete{" "}
                  <p className="inline font-semibold">{updateUser.name}</p>?
                </div>
              </Modal>
              <Modal
                title="Create User"
                open={openCreate}
                onOk={CreateUser}
                confirmLoading={confirmLoading}
                onCancel={() => setOpenCreate(false)}
                centered
              >
                <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                  <input
                    type="text"
                    placeholder="Name"
                    className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                    onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Password"
                    className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;
