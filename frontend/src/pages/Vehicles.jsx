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

const Vehicles = () => {
  const [createReg, setCreateReg] = useState("");
  const [createCapacity, setCreateCapacity] = useState("");
  const [createVtype, setCreateVtype] = useState("");
  const [createStsId, setCreateStsId] = useState("");
  const [createLoadedCost, setCreateLoadedCost] = useState("");
  const [createEmptyCost, setCreateEmptyCost] = useState("");
  const [updateReg, setUpdateReg] = useState("");
  const [updateCapacity, setUpdateCapacity] = useState("");
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

  const [vehicles, setVehicles] = useState([]);

  const showModal = () => {
    setOpenCreate(true);
  };

  const createVehicle = () => {
    setConfirmLoading(true);
    api
      .post("/vehicle", {
        reg_no: createReg,
        capacity: createCapacity,
        vtype: createVtype,
        sts_id: createStsId,
        loaded_cost: createLoadedCost,
        empty_cost: createEmptyCost,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Vehicle created successfully");
          getVehicles();
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Error occurred while creating vehicle");
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
    setUpdateVehicle({ id: id, name: name });
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
        console.log(err);
        toast.error("Error occurred while deleting vehicle");
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
          console.log(res.data);
        }
      })
      .catch((err) => {
        console.log(err);
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
    getVehicles();
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
                  All Vehicles
                </div>
                {globalState.user?.role.permissions.includes("create_role") ? (
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
              <div className="overflow-x-auto">
                <Table
                  loading={vehiclesLoading}
                  dataSource={vehicles}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                  }}
                >
                  <Column
                    title="Vehicle ID"
                    dataIndex="id"
                    sorter={(a, b) => a.id - b.id}
                  ></Column>
                  <Column
                    title="Name"
                    dataIndex="name"
                    sorter={(a, b) => a.name.localeCompare(b.name)}
                  ></Column>

                  {globalState.user?.role.permissions.includes(
                    "create_role",
                  ) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          <button
                            onClick={() => setUpdateVehicle(record)}
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
                  title="Delete Vehicle"
                  open={openDelete}
                  onOk={deleteVehicle}
                  okText="Delete"
                  onCancel={() => setOpenDelete(false)}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">{updateVehicle.name}</p>
                    ?
                  </div>
                </Modal>
                <Modal
                  title="Create Vehicle"
                  open={openCreate}
                  onOk={createVehicle}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
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
                      placeholder="Capacity"
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={setCreateCapacity}
                      options={[
                        {
                          value: 3,
                          label: "3 Ton",
                        },
                        {
                          value: 5,
                          label: "5 Ton",
                        },
                        {
                          value: 7,
                          label: "7 Ton",
                        },
                      ]}
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
                    <input
                      type="text"
                      placeholder="STS ID"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateStsId(e.target.value)}
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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Vehicles;
