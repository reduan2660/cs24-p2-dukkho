import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import { Modal, Table } from "antd";
import Column from "antd/es/table/Column";
import api from "../api";
import { Select } from "antd";
import { useGlobalState } from "../GlobalStateProvider";
import { useNavigate } from "react-router-dom";

const Roles = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [openPermission, setOpenPermission] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [assignedPermissions, setAssignedPermissions] = useState([]);
  const [unassignedPermissions, setUnassignedPermissions] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [updateRole, setUpdateRole] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [permissionIds, setPermissionIds] = useState([]);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [roles, setRoles] = useState([]);
  const nameInputRef = useRef(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchOption, setSearchOption] = useState("name");

  const showModal = () => {
    setName("");
    setOpenCreate(true);
  };

  const updatePermissions = () => {
    api
      .put(`/rbac/${updateRole.id}/permissions`, { permissions: permissionIds })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Permissions updated successfully");
          getRoles();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenUpdate(false);
        setOpenPermission(false);
      });
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
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenCreate(false);
        setConfirmLoading(false);
      });
  };

  const convertPermissions = (permissionsNames) => {
    const permissionIds = permissionsNames.map((permissionName) => {
      for (const category of permissions) {
        for (const permission of category.permissions) {
          if (permission.name === permissionName) {
            return permission.id;
          }
        }
      }
    });
    console.log(permissionIds);
    setPermissionIds(permissionIds);
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
    console.log(newAssignedPermissions);
    setUnassignedPermissions([...newUnassignedPermissions]);
    setOpenPermission(true);
  };

  const updateModal = (id, name) => {
    setUpdateRole({ id: id, name: name });
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
        toast.error(err.response.data?.message);
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
        toast.error(err.response.data?.message);
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
        toast.error(err.response.data?.message);
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
        toast.error(err.response.data?.message);
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
          if (!res.data.role.permissions.includes("list_all_roles"))
            navigate("/", { state: "access_denied" });
        }
        res.data?.role?.permissions.includes("list_all_permissions") &&
          getPermissions();
        res.data?.role?.permissions.includes("list_all_roles") && getRoles();
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (
      searchValue === "" ||
      searchValue === null ||
      searchValue === undefined
    ) {
      getRoles();
    }
  }, [searchValue]);

  useEffect(() => {
    if (editingRoleId !== null) {
      nameInputRef.current.focus();
    }
  }, [editingRoleId]);

  useEffect(() => {
    getProfile();
  }, []);

  if (profileLoading) return <br />;
  else
    return (
      <div className="min-h-screen">
        <ToastContainer
          position="top-right"
          autoClose={2000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          draggable={true}
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
              <div className="flex items-center justify-end gap-x-2">
                {searchOption === "name" ? (
                  <input
                    type="text"
                    placeholder="Search Roles"
                    className="w-[300px] rounded-md border border-[#DED2D9] px-2 py-1.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => {
                      const filteredRoles = roles.filter((role) =>
                        role.name
                          .toString()
                          .toLowerCase()
                          .includes(searchValue.toLowerCase()),
                      );
                      setRoles(filteredRoles);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const filteredRoles = roles.filter((role) =>
                          role.name
                            .toString()
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()),
                        );
                        setRoles(filteredRoles);
                      }
                    }}
                  />
                ) : (
                  <Select
                    value={searchValue}
                    className="h-12 w-[300px] py-1"
                    allowClear
                    options={permissions.map((permission) => {
                      return {
                        label: permission.category,
                        title: permission.category,
                        options: permission.permissions.map((permission) => {
                          return {
                            label: permission.name,
                            value: permission.name,
                          };
                        }),
                      };
                    })}
                    onChange={(e) => {
                      const filteredRoles = roles.filter((role) =>
                        role.permissions.includes(e),
                      );
                      setSearchValue(e);
                      setRoles(filteredRoles);
                    }}
                  />
                )}

                <Select
                  value={searchOption}
                  className="h-12 w-[200px] py-1"
                  options={[
                    { value: "name", label: "By Name" },
                    { value: "permission", label: "By Permission" },
                  ]}
                  onChange={setSearchOption}
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={rolesLoading}
                  dataSource={roles}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
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
                      render={(permission, record) => {
                        return (
                          <button
                            onClick={() => {
                              updateModal(record.id, record.name);
                              filterPermissions(record.permissions);
                            }}
                            className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                          >
                            Permissions
                          </button>
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
                  title={`Permissions for '${updateRole.name}'`}
                  open={openPermission}
                  onOk={() => setOpenUpdate(true)}
                  okText="Save"
                  onCancel={() => {
                    setOpenPermission(false);
                    setAssignedPermissions([]);
                    setUnassignedPermissions([]);
                  }}
                  closable={false}
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
                                  label: permission.name,
                                  value: permission.name,
                                };
                              },
                            ),
                          };
                        })}
                        onChange={(value) => {
                          setAssignedPermissions(value);
                          filterPermissions(value);
                          convertPermissions(value);
                        }}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {assignedPermissions.length > 0 ? (
                          assignedPermissions.map((permission, i) => {
                            return (
                              <div
                                key={i}
                                className="inline space-x-1 rounded-md bg-gray-100 px-2 py-1"
                              >
                                {permission}
                              </div>
                            );
                          })
                        ) : (
                          <div>No permissions assigned</div>
                        )}
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
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">{updateRole.name}</p>?
                  </div>
                </Modal>
                <Modal
                  title="Update Role"
                  open={openUpdate}
                  onOk={updatePermissions}
                  okText="Update"
                  onCancel={() => {
                    setOpenUpdate(false);
                  }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to update the roles for{" "}
                    <p className="inline font-semibold">{updateRole.name}</p>?
                  </div>
                </Modal>
                <Modal
                  title="Create Role"
                  open={openCreate}
                  onOk={CreateRole}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
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
