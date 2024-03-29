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

const Sts = () => {
  const navigate = useNavigate();
  const [createName, setCreateName] = useState("");
  const [createWard, setCreateWard] = useState("");
  const [createCapacity, setCreateCapacity] = useState("");
  const [createLongitude, setCreateLongitude] = useState("");
  const [createLatitude, setCreateLatitude] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateCapacity, setUpdateCapacity] = useState("");
  const [updateWard, setUpdateWard] = useState("");
  const [updateLongitude, setUpdateLongitude] = useState("");
  const [updateLatitude, setUpdateLatitude] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [stsLoading, setSTSLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [updateSTS, setUpdateSTS] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAssignManager, setOpenAssignManager] = useState(false);
  const [openVehicle, setOpenVehicle] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [assignedManagers, setAssignedManagers] = useState([]);
  const [allocatedVehicles, setAllocatedVehicles] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [usersByRole, setUsersByRole] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [managerIds, setManagerIds] = useState([]);
  const [sts, setSTS] = useState([]);

  const showModal = () => {
    setOpenCreate(true);
  };

  const assignManagers = () => {
    api
      .post(`/sts/manager`, {
        sts_id: parseInt(updateSTS.id),
        user_id: managerIds,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Manager(s) assigned successfully");
          getSTS();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
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
    setUpdateSTS({ id: id, name: name });
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
        toast.error(err.response.data?.message);
      });
  };

  const updateSTSInfo = () => {
    setConfirmLoading(true);
    api
      .put(`/sts/${updateSTS.id}`, {
        name: updateName,
        ward_no: parseInt(updateWard),
        capacity: parseFloat(updateCapacity),
        latitude: parseFloat(updateLatitude),
        longitude: parseFloat(updateLongitude),
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("STS updated successfully");
          getSTS();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
        toast.error("Error occurred while updating STS");
      })
      .finally(() => {
        setOpenEdit(false);
        setConfirmLoading(false);
      });
  };

  const createSTS = () => {
    setConfirmLoading(true);
    api
      .post("/sts", {
        name: createName,
        ward_no: parseInt(createWard),
        capacity: parseFloat(createCapacity),
        longitude: parseFloat(createLongitude),
        latitude: parseFloat(createLatitude),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("STS created successfully");
          getSTS();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
        toast.error("Error occurred while creating STS");
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
    setUpdateSTS({ id: id, name: name });
  };

  const deleteSTS = () => {
    api
      .delete(`/sts/${updateSTS.id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("STS deleted successfully");
          getSTS();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
        toast.error("Error occurred while deleting STS");
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const getSTS = () => {
    setSTSLoading(true);
    api
      .get("/sts")
      .then((res) => {
        if (res.status === 200) {
          setSTS(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setSTSLoading(false);
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
          if (!res.data.role.permissions.includes("list_all_sts"))
            navigate("/", { state: "access_denied" });
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (openEdit && updateSTS.id) {
      setUpdateName(updateSTS.name);
      setUpdateWard(updateSTS.ward_no);
      setUpdateLongitude(updateSTS.longitude);
      setUpdateLatitude(updateSTS.latitude);
    }
  }, [openEdit, updateSTS]);

  useEffect(() => {
    getUsersByRole([0, 2]);
    getSTS();
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
                  All STS
                </div>
                {globalState.user?.role.permissions.includes("create_sts") ? (
                  <div>
                    <button
                      type="button"
                      onClick={showModal}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Create STS
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={stsLoading}
                  dataSource={sts}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                  }}
                >
                  <Column
                    title="STS ID"
                    dataIndex="id"
                    sorter={(a, b) => a.id - b.id}
                  ></Column>
                  <Column
                    title="Name"
                    dataIndex="name"
                    sorter={(a, b) => a.name.localeCompare(b.name)}
                  ></Column>
                  <Column
                    title="Ward No."
                    dataIndex="ward_no"
                    sorter={(a, b) => a.ward_no - b.ward_no}
                  ></Column>
                  <Column
                    title="Capacity"
                    dataIndex="capacity"
                    sorter={(a, b) => a.capacity - b.capacity}
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
                    "create_sts",
                  ) && (
                    <Column
                      title="Managers"
                      dataIndex="managers"
                      render={(manager, record) => {
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
                  <Column
                    title="Vehicles"
                    dataIndex="vehicles"
                    render={(vehicle, record) => {
                      return (
                        <button
                          onClick={() => {
                            setAllocatedVehicles(
                              record.vehicles.map((user) => user.reg_no),
                            );
                            setOpenVehicle(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          Vehicles
                        </button>
                      );
                    }}
                  ></Column>
                  {(globalState.user?.role.permissions.includes("edit_sts") ||
                    globalState.user?.role.permissions.includes(
                      "delete_sts",
                    )) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          {globalState.user?.role.permissions.includes(
                            "edit_sts",
                          ) && (
                            <button
                              onClick={() => {
                                setUpdateSTS(record);
                                setOpenEdit(true);
                              }}
                              className="rounded-md bg-xblue px-4 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                          {globalState.user?.role.permissions.includes(
                            "delete_sts",
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
                  title="Allocated Vehicles"
                  open={openVehicle}
                  onOk={() => {
                    setOpenVehicle(false);
                  }}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="flex flex-wrap gap-2">
                    {allocatedVehicles.length > 0 ? (
                      allocatedVehicles.map((vehicle, i) => {
                        return (
                          <div
                            key={i}
                            className="inline space-x-1 rounded-md bg-gray-100 px-2 py-1"
                          >
                            {vehicle}
                          </div>
                        );
                      })
                    ) : (
                      <div>No vehicles allocated</div>
                    )}
                  </div>
                </Modal>
                <Modal
                  title="Assign Managers"
                  open={openUpdate}
                  onOk={assignManagers}
                  okText="Update"
                  onCancel={() => {
                    setOpenUpdate(false);
                  }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to assign managers(s) for{" "}
                    <p className="inline font-semibold">{updateSTS.name}</p>?
                  </div>
                </Modal>
                <Modal
                  title={`Assign Managers to STS`}
                  open={openAssignManager}
                  onOk={() => setOpenUpdate(true)}
                  okText="Save"
                  onCancel={() => {
                    setOpenAssignManager(false);
                    setSelectedManagers([]);
                  }}
                  closable={false}
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
                  title="Delete STS"
                  open={openDelete}
                  onOk={deleteSTS}
                  okText="Delete"
                  onCancel={() => setOpenDelete(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">{updateSTS.name}</p>?
                  </div>
                </Modal>
                <Modal
                  title="Create STS"
                  open={openCreate}
                  onOk={createSTS}
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
                      onChange={(e) => setCreateName(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Ward No."
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateWard(e.target.value)}
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
                  title="Edit STS Information"
                  open={openEdit}
                  onOk={updateSTSInfo}
                  okText="Update"
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenEdit(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Name"
                      value={updateName}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => updateName(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Ward No."
                      value={updateWard}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateWard(e.target.value)}
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

export default Sts;
