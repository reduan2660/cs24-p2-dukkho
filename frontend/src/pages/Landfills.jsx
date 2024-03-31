import { useEffect, useState } from "react";
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
import axios from "axios";
import MarkerComponent from "./Marker";

const Landfills = () => {
  const navigate = useNavigate();
  const [createName, setCreateName] = useState("");
  const [createCapacity, setCreateCapacity] = useState("");
  const [createLongitude, setCreateLongitude] = useState("");
  const [createLatitude, setCreateLatitude] = useState("");
  const [createStartTime, setCreateStartTime] = useState("");
  const [createEndTime, setCreateEndTime] = useState("");
  const [createLocation, setCreateLocation] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateCapacity, setUpdateCapacity] = useState("");
  const [updateCurrentCapacity, setUpdateCurrentCapacity] = useState("");
  const [updateLongitude, setUpdateLongitude] = useState("");
  const [updateLatitude, setUpdateLatitude] = useState("");
  const [updateStartTime, setUpdateStartTime] = useState("");
  const [updateEndTime, setUpdateEndTime] = useState("");
  const [updateLocation, setUpdateLocation] = useState("");
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
  const [timeArray, setTimeArray] = useState([]);
  const [searchOption, setSearchOption] = useState("name");
  const [openMap, setOpenMap] = useState(false);
  const [landfillLocation, setLandfillLocation] = useState({});

  const showModal = () => {
    setOpenCreate(true);
  };

  function convertTo12HourFormat() {
    const timeArray = [];
    for (let i = 0; i < 24; i++) {
      let label = i >= 12 ? "PM" : "AM";
      let hour = i % 12 || 12; // Convert 0 to 12
      timeArray.push({ label: `${hour} ${label}`, value: i });
    }
    setTimeArray(timeArray);
  }

  function convert24to12HourFormat(hour24) {
    let label = hour24 >= 12 ? "PM" : "AM";
    let hour12 = hour24 % 12 || 12; // Convert 0 to 12
    return `${hour12} ${label}`;
  }

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
        toast.error(err.response.data?.message);
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
        toast.error(err.response.data?.message);
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
        time_start: parseInt(updateStartTime),
        time_end: parseInt(updateEndTime),
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Landfill updated successfully");
          getLandfill();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
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
        time_start: parseInt(createStartTime),
        time_end: parseInt(createEndTime),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Landfill created successfully");
          getLandfill();
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
        toast.error(err.response.data?.message);
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
        toast.error(err.response.data?.message);
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
        res.data?.role?.permissions.includes("list_landfill") && getLandfill();
        res.data?.role?.permissions.includes("list_all_users") &&
          getUsersByRole([0, 3]);
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (openEdit) {
      setUpdateName(updateLandfill.name);
      setUpdateCapacity(updateLandfill.capacity);
      setUpdateCurrentCapacity(updateLandfill.current_capacity);
      setUpdateLongitude(updateLandfill.longitude);
      setUpdateLatitude(updateLandfill.latitude);
      setUpdateStartTime(updateLandfill.time_start);
      setUpdateEndTime(updateLandfill.time_end);
    }
    if (openCreate) {
      setCreateName("");
      setCreateCapacity("");
      setCreateLongitude("");
      setCreateLatitude("");
      setCreateStartTime("");
      setCreateEndTime("");
    }
  }, [openEdit, updateLandfill, openCreate]);

  useEffect(() => {
    const getGeoCodeCreate = () => {
      axios
        .get("https://maps.googleapis.com/maps/api/geocode/json", {
          params: {
            address: createLocation,
            key: "AIzaSyDzhASJpRuFs0t_G-lq2f7r9fTCjcpueJ8",
          },
        })
        .then((response) => {
          if (response.data.status === "OK") {
            setCreateLatitude(response.data.results[0].geometry.location.lat);
            setCreateLongitude(response.data.results[0].geometry.location.lng);
          }
        })
        .catch((error) => {
          // Handle error
          console.log("Error:", error);
        });
    };

    const getGeoCodeUpdate = () => {
      axios
        .get("https://maps.googleapis.com/maps/api/geocode/json", {
          params: {
            address: updateLocation,
            key: "AIzaSyDzhASJpRuFs0t_G-lq2f7r9fTCjcpueJ8",
          },
        })
        .then((response) => {
          if (response.data.status === "OK") {
            setUpdateLatitude(response.data.results[0].geometry.location.lat);
            setUpdateLongitude(response.data.results[0].geometry.location.lng);
          }
        })
        .catch((error) => {
          // Handle error
          console.log("Error:", error);
        });
    };

    if (createLocation.length > 0) {
      getGeoCodeCreate();
    }

    if (updateLocation.length > 0) {
      getGeoCodeUpdate();
    }
  }, [createLocation, updateLocation]);

  useEffect(() => {
    convertTo12HourFormat();
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
              <div className="flex items-center justify-end gap-x-2">
                <input
                  type="text"
                  placeholder="Search Landfill"
                  className="w-[300px] rounded-md border border-[#DED2D9] px-2 py-1.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                  onChange={(e) => {
                    const filteredLandfills = landfill.filter((landfill) =>
                      landfill[searchOption]
                        .toString()
                        .toLowerCase()
                        .includes(e.target.value.toLowerCase()),
                    );
                    setLandfill(filteredLandfills);
                  }}
                />
                <Select
                  value={searchOption}
                  className="h-12 w-[200px] py-1"
                  options={[
                    {
                      value: "name",
                      label: "By Name",
                    },
                    {
                      value: "capacity",
                      label: "By Capacity",
                    },
                    {
                      value: "current_capacity",
                      label: "By Current Capacity",
                    },
                    {
                      value: "latitude",
                      label: "By Latitude",
                    },
                    {
                      value: "longitude",
                      label: "By Longitude",
                    },
                    {
                      value: "time_start",
                      label: "By Start Time",
                    },
                    {
                      value: "time_end",
                      label: "By End Time",
                    },
                  ]}
                  onChange={setSearchOption}
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={landfillLoading}
                  dataSource={landfill}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "30"],
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
                    title="Location"
                    dataIndex="location"
                    render={(vehicle, record) => {
                      return (
                        <button
                          onClick={() => {
                            setLandfillLocation({
                              lat: record.latitude,
                              lng: record.longitude,
                            });
                            setOpenMap(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          Location
                        </button>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Start Time"
                    dataIndex="time_start"
                    sorter={(a, b) => a.time_start - b.time_start}
                    render={(time, record) => {
                      return convert24to12HourFormat(record.time_start);
                    }}
                  ></Column>
                  <Column
                    title="End Time"
                    dataIndex="time_end"
                    sorter={(a, b) => a.time_end - b.time_end}
                    render={(time, record) => {
                      return convert24to12HourFormat(record.time_end);
                    }}
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
                  title="Landfill Location"
                  open={openMap}
                  onOk={() => setOpenMap(false)}
                  width={700}
                  height={450}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="items-cenetr flex justify-center">
                    <MarkerComponent
                      height={400}
                      width={650}
                      center={landfillLocation}
                      zoom={14}
                      title={"Landfill Location"}
                    />
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
                      type="text"
                      placeholder="Location"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateLocation(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Latitude"
                      value={createLatitude}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateLatitude(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Longitude"
                      value={createLongitude}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateLongitude(e.target.value)}
                    />
                    <Select
                      placeholder="Select Start Time"
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(value) => setCreateStartTime(value)}
                      options={timeArray}
                    />
                    <Select
                      placeholder="Select End Time"
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(value) => setCreateEndTime(value)}
                      options={timeArray}
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
                      placeholder={`Location (max: ${updateCapacity})`}
                      max={updateCapacity}
                      value={updateCurrentCapacity}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const maxValue = updateCapacity;

                        if (
                          inputValue === "" ||
                          (inputValue >= 0 && inputValue <= maxValue)
                        ) {
                          setUpdateCurrentCapacity(inputValue);
                        }
                      }}
                    />
                    <Select
                      placeholder="Start Time"
                      value={updateStartTime}
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(value) => setUpdateStartTime(value)}
                      options={timeArray}
                    />
                    <Select
                      placeholder="End Time"
                      value={updateEndTime}
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(value) => setUpdateEndTime(value)}
                      options={timeArray}
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
