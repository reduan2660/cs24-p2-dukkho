import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import { Modal, Table } from "antd";
import Column from "antd/es/table/Column";
import api from "../api";
import { Select } from "antd";
import { useGlobalState } from "../GlobalStateProvider";

const Roles = () => {
  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [selectedRole, setSelectedRole] = useState({});
  const [openPermission, setOpenPermission] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [unassignedPermissions, setUnassignedPermissions] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [updateRole, setUpdateRole] = useState({});
  const [openDelete, setOpenDelete] = useState(false);

  const [roles, setRoles] = useState([]);
  const nameInputRef = useRef(null);

  const showModal = () => {
    setName("");
    setOpenCreate(true);
  };

  const CreateRole = () => {
    setConfirmLoading(true);
    api
      .post("/rbac", {
        name: name,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Role created successfully");
          getRoles();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error occurred while creating role");
      })
      .finally(() => {
        setOpenCreate(false);
        setConfirmLoading(false);
      });
  };

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      //   console.log(
      //     `selectedRowKeys: ${selectedRowKeys}`,
      //     "selectedRows: ",
      //     selectedRows,
      //   );
    },
  };

  const filterPermissions = (assignedPermissions) => {
    const newAssignedPermissions = assignedPermissions;
    const newUnassignedPermissions = [];

    permissions.forEach((category) => {
      const unassignedPermissionsInCategory = category.permissions.filter(
        (permission) => !newAssignedPermissions.includes(permission),
      );

      if (unassignedPermissionsInCategory.length > 0) {
        newUnassignedPermissions.push({
          category: category.category,
          permissions: unassignedPermissionsInCategory,
        });
      }
    });

    setAssignedPermissions([...newAssignedPermissions]);
    setUnassignedPermissions([...newUnassignedPermissions]);
    setOpenPermission(true);
  };

  const deleteModal = (id, name) => {
    setOpenDelete(true);
    setUpdateRole({ id: id, name: name });
  };

  const deleteRole = () => {
    api
      .delete(`/rbac/${updateRole.id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Role deleted successfully");
          getRoles();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error occurred while deleting role");
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const handleNameUpdate = (roleId, newName) => {
    api
      .put(`/rbac/${roleId}`, { name: newName })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Name updated successfully");
          getRoles();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error occurred while updating name");
      });
    setEditingRoleId(null);
  };

  const getPermissions = () => {
    api
      .get("/rbac/permissions")
      .then((res) => {
        setPermissions(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getRoles = () => {
    setRolesLoading(true);
    api
      .get("/rbac")
      .then((res) => {
        if (res.status === 200) {
          setRoles(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setRolesLoading(false);
      });
  };

  const getProfile = () => {
    setProfileLoading(true);
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
        console.log(err);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (editingRoleId !== null) {
      nameInputRef.current.focus();
    }
  }, [editingRoleId]);

  useEffect(() => {
    getPermissions();
    getRoles();
    getProfile();
  }, []);

  if (profileLoading) return <br />;
  else
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
                  Roles and Permissions
                </div>
                {globalState.user?.role.permissions.includes("create_role") ? (
                  <div>
                    <button
                      type="button"
                      onClick={showModal}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Create Role
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={rolesLoading}
                  dataSource={roles}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                  }}
                >
                  <Column
                    title="Role ID"
                    dataIndex="id"
                    sorter={(a, b) => a.id - b.id}
                  ></Column>
                  <Column
                    title="Name"
                    dataIndex="name"
                    sorter={(a, b) => a.name.localeCompare(b.name)}
                    render={(name, record) => {
                      return editingRoleId === record.id ? (
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
                  {globalState.user?.role.permissions.includes(
                    "view_role_permission",
                  ) && (
                    <Column
                      title="Permissions"
                      dataIndex="permissions"
                      sorter={(a, b) => a.email.localeCompare(b.email)}
                      render={(permission, record) => {
                        return record.permissions.length > 0 ? (
                          <button
                            onClick={() => {
                              filterPermissions(record.permissions);
                            }}
                            className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                          >
                            Permissions
                          </button>
                        ) : (
                          <div>No Permissions Assigned</div>
                        );
                      }}
                    ></Column>
                  )}

                  {globalState.user?.role.permissions.includes(
                    "create_role",
                  ) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          <button
                            onClick={() => setEditingRoleId(record.id)}
                            className="rounded-md bg-xblue px-4 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteModal(record.id, record.name)}
                            className="rounded-md bg-xred px-4 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    ></Column>
                  )}
                </Table>
                <Modal
                  title={`Permissions for '${selectedRole.name}'`}
                  open={openPermission}
                  onOk={() => setOpenPermission(false)}
                  okText="Save"
                  onCancel={() => {
                    setOpenPermission(false);
                    setAssignedPermissions([]);
                    setUnassignedPermissions([]);
                  }}
                  centered
                >
                  <div className="mx-2 my-4">
                    {globalState.user?.role.permissions.includes(
                      "edit_role_permission",
                    ) ? (
                      <Select
                        value={assignedPermissions}
                        className="w-full"
                        mode="multiple"
                        allowClear
                        options={unassignedPermissions.map((permission) => {
                          return {
                            label: permission.category,
                            title: permission.category,
                            options: permission.permissions.map(
                              (permission) => {
                                return {
                                  label: permission,
                                  value: permission,
                                };
                              },
                            ),
                          };
                        })}
                        onChange={(value) => {
                          setAssignedPermissions(value);
                          filterPermissions(value);
                          console.log(value);
                        }}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {assignedPermissions.map((permission) => {
                          return (
                            <div className="inline space-x-1 rounded-md bg-gray-100 px-2 py-1">
                              {permission}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Modal>
                <Modal
                  title="Delete Role"
                  open={openDelete}
                  onOk={deleteRole}
                  okText="Delete"
                  onCancel={() => setOpenDelete(false)}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">{updateRole.name}</p>?
                  </div>
                </Modal>
                <Modal
                  title="Create Role"
                  open={openCreate}
                  onOk={CreateRole}
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
                  </div>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Roles;