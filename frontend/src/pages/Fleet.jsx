import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import { Modal, Table } from "antd";
import Column from "antd/es/table/Column";
import api from "../api";
import { useGlobalState } from "../GlobalStateProvider";
import { useNavigate } from "react-router-dom";
import { Select } from "antd";

const Fleet = () => {
  const navigate = useNavigate();
  const [weight, setWeight] = useState("");
  const [StsId, setStsId] = useState("");
  const [STS, setSTS] = useState([]);
  const [profileLoading, setProfileLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [fleet, setFleet] = useState();

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

  const generateFleet = () => {
    setConfirmLoading(true);
    api
      .post("/transfer/fleet", {
        sts_id: StsId,
        weight: weight,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Fleet planning generated successfully");
          setFleet(res.data);
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

  const createTransfer = (vehicleId, landfillId, weight, oil) => {
    api
      .post("/transfer/sts/departure", {
        vehicle_id: parseInt(vehicleId),
        landfill_id: parseInt(landfillId),
        weight: parseFloat(weight),
        oil: parseFloat(oil),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Transfer created successfully");
          setFleet(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
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
          if (!res.data.role.permissions.includes("view_transfer"))
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
    getSTS();
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
                  All Fleet Transfers
                </div>
                {globalState.user?.role.permissions.includes(
                  "update_transfer_sts",
                ) ||
                globalState.user?.role.permissions.includes("view_transfer") ? (
                  <div>
                    <button
                      type="button"
                      onClick={showModal}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Generate Fleet Planning
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={confirmLoading}
                  dataSource={fleet?.transfers}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  rowSelection={{
                    type: "checkbox",
                    ...rowSelection,
                  }}
                >
                  <Column
                    title="Assignable Vehicle"
                    dataIndex="reg_no"
                    sorter={(a, b) => a.reg_no - b.reg_no}
                    render={(vehicle, record) => {
                      return <div>{record.vehicle.reg_no}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Desination Landfill"
                    dataIndex="name"
                    sorter={(a, b) => a.name.localeCompare(b.name)}
                    render={(vehicle, record) => {
                      return <div>{record.landfill.name}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Allocated Weight (Tonnes)"
                    dataIndex="weight"
                    sorter={(a, b) => a.weight - b.weight}
                    render={(vehicle, record) => {
                      return <div>{record.weight}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Required Oil (L)"
                    dataIndex="oil"
                    sorter={(a, b) => a.oil - b.oil}
                    render={(vehicle, record) => {
                      return <div>{record.cost}</div>;
                    }}
                  ></Column>
                  {globalState.user?.role.permissions.includes(
                    "update_transfer_sts",
                  ) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          <button
                            onClick={() => {
                              createTransfer(
                                record.vehicle.id,
                                record.landfill.id,
                                record.weight,
                                record.cost,
                              );
                            }}
                            className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                          >
                            Create Transfer Record
                          </button>
                        </div>
                      )}
                    ></Column>
                  )}
                </Table>
                <Modal
                  title="Generate Fleet Planning"
                  open={openCreate}
                  onOk={generateFleet}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    {!globalState.user?.role.permissions.includes(
                      "update_transfer_sts",
                    ) &&
                      globalState.user?.role.permissions.includes(
                        "view_transfer",
                      ) && (
                        <Select
                          placeholder="Select STS"
                          className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                          onChange={setStsId}
                          options={STS.map((sts) => {
                            return { label: sts.name, value: sts.id };
                          })}
                        />
                      )}

                    <input
                      type="number"
                      placeholder={`Weight of waste`}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
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

export default Fleet;
