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
import { useNavigate } from "react-router-dom";

const Landfills = () => {
  const navigate = useNavigate();
  const [createName, setCreateName] = useState("");
  const [createCapacity, setCreateCapacity] = useState("");
  const [createLongitude, setCreateLongitude] = useState("");
  const [createLatitude, setCreateLatitude] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateCapacity, setUpdateCapacity] = useState("");
  const [updateCurrentCapacity, setUpdateCurrentCapacity] = useState("");
  const [updateLongitude, setUpdateLongitude] = useState("");
  const [updateLatitude, setUpdateLatitude] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [landfillLoading, setLandfillLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [updateLandfill, setUpdateLandfill] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAssignManager, setOpenAssignManager] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [assignedManagers, setAssignedManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [usersByRole, setUsersByRole] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [managerIds, setManagerIds] = useState([]);
  const [landfill, setLandfill] = useState([]);

  const showModal = () => {
    setOpenCreate(true);
  };

  const assignManagers = () => {
    api
      .post(`/landfill/manager`, {
        landfill_id: parseInt(updateLandfill.id),
        user_id: managerIds,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Manager(s) assigned successfully");
          getLandfill();
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          toast.error(err.response.data?.message);
        }
        toast.error("Error occurred while assigning manager(s)");
      })
      .finally(() => {
        setOpenAssignManager(false);
        setOpenUpdate(false);
        setSelectedManagers([]);
      });
  };

  const convertManagers = (managers) => {
    const selectedManagers = usersByRole
      .filter((user) => managers.includes(user.name))
      .map((user) => user.id);
    setManagerIds(selectedManagers);
  };

  const updateModal = (id, name) => {
    setUpdateLandfill({ id: id, name: name });
  };

  function getRemainingUsers(selectedUserIds) {
    const remainingUsers = usersByRole.filter(
      (user) => !selectedUserIds.includes(user.id),
    );
    setUnassignedUsers(remainingUsers);
  }

  const getUsersByRole = (roles) => {
    const params = new URLSearchParams();

    roles.forEach((role) => {
      params.append("roles", role);
    });

    const queryString = params.toString();
    api
      .get(`/users?${queryString}`)
      .then((res) => {
        setUsersByRole(res.data);
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          toast.error(err.response.data?.message);
        }
      });
  };

  const updateLandfillInfo = () => {
    setConfirmLoading(true);
    api
      .put(`/landfill/${updateLandfill.id}`, {
        name: updateName,
        current_capacity: parseInt(updateCurrentCapacity),
        capacity: parseInt(updateCapacity),
        latitude: parseFloat(updateLatitude),
        longitude: parseFloat(updateLongitude),
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Landfill updated successfully");
          getLandfill();
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          toast.error(err.response.data?.message);
        }
        toast.error("Error occurred while updating Landfill");
      })
      .finally(() => {
        setOpenEdit(false);
        setConfirmLoading(false);
      });
  };

  const createLandfill = () => {
    setConfirmLoading(true);
    api
      .post("/landfill", {
        name: createName,
        capacity: parseInt(createCapacity),
        longitude: parseFloat(createLongitude),
        latitude: parseFloat(createLatitude),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Landfill created successfully");
          getLandfill();
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          toast.error(err.response.data?.message);
        }
        toast.error("Error occurred while creating Landfill");
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

  const deleteModal = (id, name) => {
    setOpenDelete(true);
    setUpdateLandfill({ id: id, name: name });
  };

  const deleteLandfill = () => {
    api
      .delete(`/landfill/${updateLandfill.id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Landfill deleted successfully");
          getLandfill();
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          toast.error(err.response.data?.message);
        }
        toast.error("Error occurred while deleting Landfill");
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const getLandfill = () => {
    setLandfillLoading(true);
    api
      .get("/landfill")
      .then((res) => {
        if (res.status === 200) {
          setLandfill(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          toast.error(err.response.data?.message);
        }
      })
      .finally(() => {
        setLandfillLoading(false);
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
          if (!res.data.role.permissions.includes("list_landfill"))
            navigate("/", { state: "access_denied" });
        }
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 400) {
          toast.error(err.response.data?.message);
        }
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (openEdit && updateLandfill.id) {
      setUpdateName(updateLandfill.name);
      setUpdateCapacity(updateLandfill.capacity);
      setUpdateLongitude(updateLandfill.longitude);
      setUpdateLatitude(updateLandfill.latitude);
    }
  }, [openEdit, updateLandfill]);

  useEffect(() => {
    getUsersByRole([0, 3]);
    getLandfill();
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
                  All Landfills
                </div>
                {globalState.user?.role.permissions.includes(
                  "create_landfill",
                ) ? (
                  <div>
                    <button
                      type="button"
                      onClick={showModal}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Create Landfill
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={landfillLoading}
                  dataSource={landfill}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                  }}
                >
                  <Column
                    title="Landfill ID"
                    dataIndex="id"
                    sorter={(a, b) => a.id - b.id}
                  ></Column>
                  <Column
                    title="Name"
                    dataIndex="name"
                    sorter={(a, b) => a.name.localeCompare(b.name)}
                  ></Column>
                  <Column
                    title="Capacity"
                    dataIndex="capacity"
                    sorter={(a, b) => a.capacity - b.capacity}
                  ></Column>
                  <Column
                    title="Current Capacity"
                    dataIndex="current_capacity"
                    sorter={(a, b) => a.current_capacity - b.current_capacity}
                  ></Column>
                  <Column
                    title="Latitude"
                    dataIndex="latitude"
                    sorter={(a, b) => a.latitude - b.latitude}
                  ></Column>
                  <Column
                    title="Longitude"
                    dataIndex="longitude"
                    sorter={(a, b) => a.longitude - b.longitude}
                  ></Column>
                  {globalState.user?.role.permissions.includes(
                    "create_landfill",
                  ) && (
                    <Column
                      title="Managers"
                      dataIndex="managers"
                      render={(permission, record) => {
                        return (
                          <button
                            onClick={() => {
                              updateModal(record.id, record.name);
                              setAssignedManagers(
                                record.managers.map((user) => user.name),
                              );
                              setOpenAssignManager(true);
                              getRemainingUsers(
                                record.managers.map((user) => user.id),
                              );
                            }}
                            className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                          >
                            Managers
                          </button>
                        );
                      }}
                    ></Column>
                  )}
                  {(globalState.user?.role.permissions.includes(
                    "edit_landfill",
                  ) ||
                    globalState.user?.role.permissions.includes(
                      "delete_landfill",
                    )) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          {globalState.user?.role.permissions.includes(
                            "edit_landfill",
                          ) && (
                            <button
                              onClick={() => {
                                setUpdateLandfill(record);
                                setOpenEdit(true);
                              }}
                              className="rounded-md bg-xblue px-4 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                          {globalState.user?.role.permissions.includes(
                            "delete_landfill",
                          ) && (
                            <button
                              onClick={() =>
                                deleteModal(record.id, record.name)
                              }
                              className="rounded-md bg-xred px-4 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-red-600"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    ></Column>
                  )}
                </Table>
                <Modal
                  title="Assign Managers"
                  open={openUpdate}
                  onOk={assignManagers}
                  okText="Update"
                  onCancel={() => {
                    setOpenUpdate(false);
                  }}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to assign managers(s) for{" "}
                    <p className="inline font-semibold">
                      {updateLandfill.name}
                    </p>
                    ?
                  </div>
                </Modal>
                <Modal
                  title={`Assign Managers to Landfill`}
                  open={openAssignManager}
                  onOk={() => setOpenUpdate(true)}
                  okText="Save"
                  onCancel={() => {
                    setOpenAssignManager(false);
                    setSelectedManagers([]);
                  }}
                  centered
                >
                  <div className="mx-2 my-4">
                    {globalState.user?.role.permissions.includes(
                      "assign_role_to_user",
                    ) ? (
                      <Select
                        value={assignedManagers}
                        className="w-full"
                        mode="multiple"
                        allowClear
                        options={unassignedUsers.map((user) => ({
                          value: user.name,
                          label: user.name,
                        }))}
                        onChange={(value) => {
                          convertManagers(value);
                          setAssignedManagers(value);
                          getRemainingUsers(value);
                        }}
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedManagers.length > 0 ? (
                          selectedManagers.map((manager, i) => {
                            return (
                              <div
                                key={i}
                                className="inline space-x-1 rounded-md bg-gray-100 px-2 py-1"
                              >
                                {manager.name}
                              </div>
                            );
                          })
                        ) : (
                          <div>No managers selected</div>
                        )}
                      </div>
                    )}
                  </div>
                </Modal>
                <Modal
                  title="Delete Landfill"
                  open={openDelete}
                  onOk={deleteLandfill}
                  okText="Delete"
                  onCancel={() => setOpenDelete(false)}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">
                      {updateLandfill.name}
                    </p>
                    ?
                  </div>
                </Modal>
                <Modal
                  title="Create Landfill"
                  open={openCreate}
                  onOk={createLandfill}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Name"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateName(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateCapacity(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Latitude"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateLatitude(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Longitude"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateLongitude(e.target.value)}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Edit Landfill Information"
                  open={openEdit}
                  onOk={updateLandfillInfo}
                  okText="Update"
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenEdit(false)}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Name"
                      value={updateName}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateName(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Capacity"
                      value={updateCapacity}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateCapacity(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Current Capacity"
                      value={updateCurrentCapacity}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateCurrentCapacity(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Latitude"
                      value={updateLatitude}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateLatitude(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Longitude"
                      value={updateLongitude}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateLongitude(e.target.value)}
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

export default Landfills;
