import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import { Modal, Table, TimePicker, Tooltip } from "antd";
import Column from "antd/es/table/Column";
import api from "../api";
import { Select } from "antd";
import { useGlobalState } from "../GlobalStateProvider";
import { useNavigate } from "react-router-dom";

const Plans = () => {
  const navigate = useNavigate();
  const [createAreaOfCollection, setCreateAreaOfCollection] = useState("");
  const [createStartHr, setCreateStartHr] = useState("");
  const [createStartMin, setCreateStartMin] = useState("");
  const [createDuration, setCreateDuration] = useState("");
  const [createWard, setCreateWard] = useState("");
  const [createNoOfVehicle, setCreateNoOfVehicle] = useState("");
  const [createDailyWasteTon, setCreateDailyWasteTon] = useState("");
  const [updateAreaOfCollection, setUpdateAreaOfCollection] = useState("");
  const [updateStartHr, setUpdateStartHr] = useState("");
  const [updateStartMin, setUpdateStartMin] = useState("");
  const [updateDuration, setUpdateDuration] = useState("");
  const [updateWard, setUpdateWard] = useState("");
  const [updateNoOfVehicle, setUpdateNoOfVehicle] = useState("");
  const [updateDailyWasteTon, setUpdateDailyWasteTon] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [updatePlans, setUpdatePlans] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [plans, setPlans] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchOption, setSearchOption] = useState("area_of_collection");

  const showModal = () => {
    setOpenCreate(true);
  };

  const handleCreateTime = (time, timeString) => {
    const timeStringArray = timeString.split(":");
    setCreateStartHr(timeStringArray[0]);
    setCreateStartMin(timeStringArray[1]);
  };

  const handleUpdateTime = (time, timeString) => {
    const timeStringArray = timeString.split(":");
    setUpdateStartHr(timeStringArray[0]);
    setUpdateStartMin(timeStringArray[1]);
  };

  const updatePlansInfo = () => {
    setConfirmLoading(true);
    api
      .put(`/plan/${updatePlans.id}`, {
        area_of_collection: updateAreaOfCollection,
        start_time_hr: parseInt(updateStartHr),
        start_time_min: parseInt(updateStartMin),
        ward: updateWard,
        duration: parseFloat(updateDuration),
        no_of_vehicle: parseInt(updateNoOfVehicle),
        daily_waste_ton: parseFloat(updateDailyWasteTon),
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Plan updated successfully");
          getPlans();
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

  const createPlans = () => {
    setConfirmLoading(true);
    api
      .post("/plan", {
        area_of_collection: createAreaOfCollection,
        start_time_hr: parseInt(createStartHr),
        start_time_min: parseInt(createStartMin),
        ward: createWard,
        duration: parseFloat(createDuration),
        no_of_vehicle: parseInt(createNoOfVehicle),
        daily_waste_ton: parseFloat(createDailyWasteTon),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Plan created successfully");
          getPlans();
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
    setUpdatePlans({ id: id, name: name });
  };

  const deletePlans = () => {
    api
      .delete(`/plan/${updatePlans.id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Plan deleted successfully");
          getPlans();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const getPlans = () => {
    setPlansLoading(true);
    api
      .get("/plan")
      .then((res) => {
        if (res.status === 200) {
          setPlans(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setPlansLoading(false);
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
          if (!res.data.role.permissions.includes("list_plan"))
            navigate("/", { state: "access_denied" });
        }
        res.data?.role?.permissions.includes("list_plan") && getPlans();
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (searchValue === "") {
      getPlans();
    }
  }, [searchValue]);

  useEffect(() => {
    if (openEdit) {
      setUpdateAreaOfCollection(updatePlans.area_of_collection);
      setUpdateStartHr(updatePlans.start_time_hr);
      setUpdateStartMin(updatePlans.start_time_min);
      setUpdateWard(updatePlans.ward);
      setUpdateDuration(updatePlans.duration);
      setUpdateNoOfVehicle(updatePlans.no_of_vehicle);
      setUpdateDailyWasteTon(updatePlans.daily_waste_ton);
    }
    if (openCreate) {
      setCreateAreaOfCollection("");
      setCreateStartHr("");
      setCreateStartMin("");
      setCreateWard("");
      setCreateDuration("");
      setCreateNoOfVehicle("");
      setCreateDailyWasteTon("");
    }
  }, [openEdit, openCreate, updatePlans]);

  useEffect(() => {
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
                  All Plans
                </div>
                {globalState.user?.role.permissions.includes("create_plan") ? (
                  <div>
                    <button
                      type="button"
                      onClick={showModal}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Create Plans
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="flex items-center justify-end gap-x-2">
                <Tooltip
                  placement="top"
                  title={
                    <span>
                      Press &apos;Enter&apos; to Search <br />
                      Clear Input to Reset
                    </span>
                  }
                >
                  <input
                    type="text"
                    placeholder="Search Plans"
                    className="w-[300px] rounded-md border border-[#DED2D9] px-2 py-1.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => {
                      const filteredPlans = plans.filter((plans) =>
                        plans[searchOption]
                          .toString()
                          .toLowerCase()
                          .includes(searchValue.toLowerCase()),
                      );
                      setPlans(filteredPlans);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const filteredPlans = plans.filter((plans) =>
                          plans[searchOption]
                            .toString()
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()),
                        );
                        setPlans(filteredPlans);
                      }
                    }}
                  />
                </Tooltip>
                <Select
                  value={searchOption}
                  className="h-12 w-[200px] py-1"
                  options={[
                    {
                      value: "area_of_collection",
                      label: "Area of Collection",
                    },
                    {
                      value: "start_time_hr",
                      label: "Start Time Hour",
                    },
                    {
                      value: "start_time_min",
                      label: "Start Time Minute",
                    },
                    {
                      value: "duration",
                      label: "Duration",
                    },
                    {
                      value: "no_of_vehicle",
                      label: "Number of Vehicles",
                    },
                    {
                      value: "daily_waste_ton",
                      label: "Daily Waste Ton",
                    },
                  ]}
                  onChange={setSearchOption}
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={plansLoading}
                  dataSource={plans}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "30"],
                  }}
                >
                  <Column
                    title="Area of Collection"
                    dataIndex="area_of_collection"
                    sorter={(a, b) =>
                      a.area_of_collection.localeCompare(b.area_of_collection)
                    }
                  />
                  <Column
                    title="Contractor"
                    dataIndex="contractor"
                    sorter={(a, b) => a.contractor.localeCompare(b.contractor)}
                    render={(contractor, record) => {
                      return <div>{record.contract.name}</div>;
                    }}
                  />
                  <Column
                    title="Start Time Hour"
                    dataIndex="start_time_hr"
                    sorter={(a, b) => a.start_time_hr - b.start_time_hr}
                  />
                  <Column
                    title="Start Time Minute"
                    dataIndex="start_time_min"
                    sorter={(a, b) => a.start_time_min - b.start_time_min}
                  />
                  <Column
                    title="Duration"
                    dataIndex="duration"
                    sorter={(a, b) => a.duration - b.duration}
                  />
                  <Column
                    title="Ward"
                    dataIndex="ward"
                    sorter={(a, b) => a.duration.localeCompare(b.duration)}
                  />
                  <Column
                    title="Number of Vehicles"
                    dataIndex="no_of_vehicle"
                    sorter={(a, b) => a.no_of_vehicle - b.no_of_vehicle}
                  />
                  <Column
                    title="Daily Waste Ton"
                    dataIndex="daily_waste_ton"
                    sorter={(a, b) => a.daily_waste_ton - b.daily_waste_ton}
                  />
                  {(globalState.user?.role.permissions.includes("edit_plan") ||
                    globalState.user?.role.permissions.includes(
                      "delete_plan",
                    )) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          {globalState.user?.role.permissions.includes(
                            "edit_plan",
                          ) && (
                            <button
                              onClick={() => {
                                setUpdatePlans(record);
                                setOpenEdit(true);
                              }}
                              className="rounded-md bg-xblue px-4 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                          {globalState.user?.role.permissions.includes(
                            "delete_plan",
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
                  title="Delete Plan"
                  open={openDelete}
                  onOk={deletePlans}
                  okText="Delete"
                  onCancel={() => setOpenDelete(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">{updatePlans.name}</p>?
                  </div>
                </Modal>
                <Modal
                  title="Create Plan"
                  open={openCreate}
                  onOk={createPlans}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Area of Collection"
                      value={createAreaOfCollection}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) =>
                        setCreateAreaOfCollection(e.target.value)
                      }
                    />
                    <TimePicker format={"HH:mm"} onChange={handleCreateTime} />
                    <input
                      type="number"
                      placeholder="Duration (hours)"
                      value={createDuration}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateDuration(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Ward"
                      value={createWard}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateWard(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Number of Vehicles"
                      value={createNoOfVehicle}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateNoOfVehicle(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Daily Waste Ton"
                      value={createDailyWasteTon}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateDailyWasteTon(e.target.value)}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Edit Plan Information"
                  open={openEdit}
                  onOk={updatePlansInfo}
                  okText="Update"
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenEdit(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Area of Collection"
                      value={updateAreaOfCollection}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) =>
                        setUpdateAreaOfCollection(e.target.value)
                      }
                    />
                    <TimePicker format={"HH:mm"} onChange={handleUpdateTime} />
                    <input
                      type="number"
                      placeholder="Duration"
                      value={updateDuration}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateDuration(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Ward"
                      value={updateWard}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateWard(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Number of Vehicles"
                      value={updateNoOfVehicle}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateNoOfVehicle(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Daily Waste Ton"
                      value={updateDailyWasteTon}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateDailyWasteTon(e.target.value)}
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

export default Plans;
