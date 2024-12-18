import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import { Modal, Table, Tooltip } from "antd";
import Column from "antd/es/table/Column";
import api from "../api";
import { Select } from "antd";
import { useGlobalState } from "../GlobalStateProvider";
import { useNavigate } from "react-router-dom";

const Vehicles = () => {
  const navigate = useNavigate();
  const [createReg, setCreateReg] = useState("");
  const [createVtype, setCreateVtype] = useState("");
  const [createStsId, setCreateStsId] = useState("");
  const [createLoadedCost, setCreateLoadedCost] = useState("");
  const [createEmptyCost, setCreateEmptyCost] = useState("");
  const [updateReg, setUpdateReg] = useState("");
  const [updateVtype, setUpdateVtype] = useState("");
  const [updateStsId, setUpdateStsId] = useState("");
  const [updateLoadedCost, setUpdateLoadedCost] = useState("");
  const [updateEmptyCost, setUpdateEmptyCost] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [updateVehicle, setUpdateVehicle] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [STS, setSTS] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchOption, setSearchOption] = useState("reg_no");

  const [vehicles, setVehicles] = useState([]);

  const vehicleWeight = {
    Open: "3",
    Dump: "5",
    Compactor: "7",
    Container: "15",
  };

  const showModal = () => {
    setOpenCreate(true);
  };

  const getSTS = () => {
    api
      .get("/sts")
      .then((res) => {
        if (res.status === 200) {
          setSTS(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const updateVehicleInfo = () => {
    setConfirmLoading(true);
    api
      .put(`/vehicle/${updateVehicle.id}`, {
        reg_no: updateReg,
        capacity: parseInt(vehicleWeight[updateVtype]),
        vtype: updateVtype,
        sts_id: parseInt(updateStsId),
        loaded_cost: parseFloat(updateLoadedCost),
        empty_cost: parseFloat(updateEmptyCost),
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Vehicle updated successfully");
          getVehicles();
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

  const createVehicle = () => {
    setConfirmLoading(true);
    api
      .post("/vehicle", {
        reg_no: createReg,
        capacity: parseInt(vehicleWeight[createVtype]),
        vtype: createVtype,
        sts_id: parseInt(createStsId),
        loaded_cost: parseFloat(createLoadedCost),
        empty_cost: parseFloat(createEmptyCost),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Vehicle created successfully");
          getVehicles();
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

  const deleteModal = (id, reg_no) => {
    setOpenDelete(true);
    setUpdateVehicle({ id: id, reg_no: reg_no });
  };

  const deleteVehicle = () => {
    api
      .delete(`/vehicle/${updateVehicle.id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Vehicle deleted successfully");
          getVehicles();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const getVehicles = () => {
    setVehiclesLoading(true);
    api
      .get("/vehicle")
      .then((res) => {
        if (res.status === 200) {
          setVehicles(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setVehiclesLoading(false);
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
          if (!res.data.role.permissions.includes("list_vehicle"))
            navigate("/", { state: "access_denied" });
        }
        res.data?.role?.permissions.includes("list_all_sts") && getSTS();
        res.data?.role?.permissions.includes("list_vehicle") && getVehicles();
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
      getVehicles();
    }
  }, [searchValue]);

  useEffect(() => {
    if (openEdit) {
      setUpdateReg(updateVehicle.reg_no);
      setUpdateVtype(updateVehicle.vtype);
      setUpdateStsId(updateVehicle.sts["id"]);
      setUpdateLoadedCost(updateVehicle.loaded_cost.toString());
      setUpdateEmptyCost(updateVehicle.empty_cost.toString());
    }
    if (openCreate) {
      setCreateReg("");
      setCreateVtype("");
      setCreateStsId("");
      setCreateLoadedCost("");
      setCreateEmptyCost("");
    }
  }, [openEdit, updateVehicle, openCreate]);

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
                  All Vehicles
                </div>
                {globalState.user?.role.permissions.includes(
                  "create_vehicle",
                ) ? (
                  <div>
                    <button
                      type="button"
                      onClick={showModal}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Create Vehicle
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
                    placeholder="Search Vehicle"
                    className="w-[300px] rounded-md border border-[#DED2D9] px-2 py-1.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => {
                      const filteredVehicles = vehicles.filter((vehicle) =>
                        vehicle[searchOption]
                          .toString()
                          .toLowerCase()
                          .includes(searchValue.toLowerCase()),
                      );
                      setVehicles(filteredVehicles);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const filteredVehicles = vehicles.filter((vehicle) =>
                          vehicle[searchOption]
                            .toString()
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()),
                        );
                        setVehicles(filteredVehicles);
                      }
                    }}
                  />
                </Tooltip>
                <Select
                  value={searchOption}
                  className="h-12 w-[200px] py-1"
                  options={[
                    {
                      value: "id",
                      label: "By Vehicle ID",
                    },
                    {
                      value: "reg_no",
                      label: "By Reg No.",
                    },
                    {
                      value: "capacity",
                      label: "By Capacity",
                    },
                    {
                      value: "vtype",
                      label: "By Vehicle Type",
                    },
                    {
                      value: "sts",
                      label: "By Assigned STS",
                    },
                    {
                      value: "available",
                      label: "By Status",
                    },
                    {
                      value: "loaded_cost",
                      label: "By Loaded Cost",
                    },
                    {
                      value: "empty_cost",
                      label: "By Empty Cost",
                    },
                  ]}
                  onChange={setSearchOption}
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={vehiclesLoading}
                  dataSource={vehicles}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "30"],
                  }}
                >
                  <Column
                    title="Vehicle ID"
                    dataIndex="id"
                    sorter={(a, b) => a.id - b.id}
                  ></Column>
                  <Column
                    title="Reg No."
                    dataIndex="reg_no"
                    sorter={(a, b) => a.reg_no.localeCompare(b.reg_no)}
                  ></Column>
                  <Column
                    title="Capacity"
                    dataIndex="capacity"
                    sorter={(a, b) => a.capacity - b.capacity}
                  ></Column>
                  <Column
                    title="Vehicle Type"
                    dataIndex="vtype"
                    sorter={(a, b) => a.vtype.localeCompare(b.vtype)}
                  ></Column>
                  <Column
                    title="Assigned STS"
                    dataIndex="sts"
                    sorter={(a, b) => a.sts.name.localeCompare(b.sts.name)}
                    render={(sts, record) => <div>{record.sts.name}</div>}
                  ></Column>
                  <Column
                    title="Status"
                    dataIndex="available"
                    sorter={(a, b) => a.available.localeCompare(b.available)}
                    render={(sts, record) =>
                      record.available === 0 ? (
                        <div className="text-dark rounded-full bg-xyellow px-2 py-1 text-center text-sm">
                          In Transit
                        </div>
                      ) : (
                        <div className="rounded-full bg-green-600 px-2 py-1 text-center text-sm text-white">
                          Available
                        </div>
                      )
                    }
                  ></Column>
                  <Column
                    title="Loaded Cost"
                    dataIndex="loaded_cost"
                    sorter={(a, b) => a.loaded_cost - b.loaded_cost}
                  ></Column>
                  <Column
                    title="Empty Cost"
                    dataIndex="empty_cost"
                    sorter={(a, b) => a.empty_cost - b.empty_cost}
                  ></Column>

                  {(globalState.user?.role.permissions.includes(
                    "edit_vehicle",
                  ) ||
                    globalState.user?.role.permissions.includes(
                      "delete_vehicle",
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
                                setUpdateVehicle(record);
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
                                deleteModal(record.id, record.reg_no)
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
                  title="Delete Vehicle"
                  open={openDelete}
                  onOk={deleteVehicle}
                  okText="Delete"
                  onCancel={() => setOpenDelete(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">
                      {updateVehicle.reg_no}
                    </p>
                    ?
                  </div>
                </Modal>
                <Modal
                  title="Create Vehicle"
                  open={openCreate}
                  onOk={createVehicle}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Reg No."
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateReg(e.target.value)}
                    />
                    <Select
                      placeholder="Vehicle type"
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={setCreateVtype}
                      options={[
                        {
                          value: "Open",
                          label: "Open Truck",
                        },
                        {
                          value: "Dump",
                          label: "Dump Truck",
                        },
                        {
                          value: "Compactor",
                          label: "Compactor",
                        },
                        {
                          value: "Container",
                          label: "Container Carrier",
                        },
                      ]}
                    />
                    <Select
                      placeholder="Assign STS"
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={setCreateStsId}
                      options={STS.map((sts) => {
                        return {
                          value: sts.id,
                          label: sts.name,
                        };
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Loaded Cost"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateLoadedCost(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Empty Cost"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateEmptyCost(e.target.value)}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Edit Vehicle Information"
                  open={openEdit}
                  onOk={updateVehicleInfo}
                  okText="Update"
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenEdit(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Reg No."
                      value={updateReg}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateReg(e.target.value)}
                    />
                    <Select
                      placeholder="Vehicle type"
                      value={updateVtype}
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={setUpdateVtype}
                      options={[
                        {
                          value: "Open",
                          label: "Open Truck",
                        },
                        {
                          value: "Dump",
                          label: "Dump Truck",
                        },
                        {
                          value: "Compactor",
                          label: "Compactor",
                        },
                        {
                          value: "Container",
                          label: "Container Carrier",
                        },
                      ]}
                    />
                    <Select
                      placeholder="Assign STS"
                      value={updateStsId}
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={setUpdateStsId}
                      options={STS.map((sts) => {
                        return {
                          value: sts.id,
                          label: sts.name,
                        };
                      })}
                    />
                    <input
                      type="number"
                      placeholder="Loaded Cost"
                      value={updateLoadedCost}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateLoadedCost(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Empty Cost"
                      value={updateEmptyCost}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateEmptyCost(e.target.value)}
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

export default Vehicles;
