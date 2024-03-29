import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import { Modal, Table } from "antd";
import Column from "antd/es/table/Column";
import api from "../api";
import { useGlobalState } from "../GlobalStateProvider";
import { useNavigate } from "react-router-dom";
import PdfGenerator from "../components/PDFGenerator";

const TransferLandfill = () => {
  const navigate = useNavigate();
  const [profileLoading, setProfileLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [assignedVehicle, setAssignedVehicle] = useState({});
  const [associatedSTS, setAssociatedSTS] = useState({});
  const [associatedLandfill, setAssociatedLandfill] = useState({});
  const [transferRecords, setTransferRecords] = useState([]);
  const [viewVehicle, setViewVehicle] = useState(false);
  const [viewSTS, setViewSTS] = useState(false);
  const [viewLandfill, setViewLandfill] = useState(false);
  const [openArrival, setOpenArrival] = useState(false);
  const [weight, setWeight] = useState("");
  const [transfer, setTransfer] = useState("");
  const [viewInfo, setViewInfo] = useState(false);

  function getStatusColor(statusId) {
    switch (statusId) {
      case 1:
        return "bg-yellow-500"; // Departed from sts
      case 2:
        return "bg-blue-600"; // Arrived at landfill
      case 3:
        return "bg-orange-500"; // Departed from landfill
      case 4:
        return "bg-green-600"; // Trip completed
      default:
        return "bg-gray-600"; // Default color if statusId is unknown
    }
  }

  const convertUTC = (time) => {
    return new Date(time).toLocaleString();
  };

  const setArrivedAtLandfill = () => {
    api
      .patch(`/transfer/landfill/arrival/${transfer.id}`, {
        weight: parseFloat(weight),
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Arrived at Landfill successfully");
          getTransfers();
          setOpenArrival(false);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const setDepartedFromLandfill = (id) => {
    api
      .patch(`/transfer/landfill/departure/${id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Departed from Landfill successfully");
          getTransfers();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const getTransfers = () => {
    setTransferLoading(true);
    api
      .get("/transfer")
      .then((res) => {
        if (res.status === 200) {
          setTransferRecords(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setTransferLoading(false);
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
    getTransfers();
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
                  All Transfer Records
                </div>
                <div></div>
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={transferLoading}
                  dataSource={transferRecords}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                >
                  <Column
                    title="Transfer ID"
                    dataIndex="id"
                    sorter={(a, b) => a.id - b.id}
                  ></Column>
                  <Column
                    title="Assigned Vehicle"
                    dataIndex="vehicle"
                    render={(vehicle, record) => {
                      return (
                        <button
                          onClick={() => {
                            setAssignedVehicle(record.vehicle);
                            setViewVehicle(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          {record.vehicle.reg_no}
                        </button>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Associated STS"
                    dataIndex="sts"
                    render={(vehicle, record) => {
                      return (
                        <button
                          onClick={() => {
                            setAssociatedSTS(record.sts);
                            setViewSTS(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          {record.sts.name}
                        </button>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Associated Landfill"
                    dataIndex="landfill"
                    render={(vehicle, record) => {
                      return (
                        <button
                          onClick={() => {
                            setAssociatedLandfill(record.landfill);
                            setViewLandfill(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          {record.landfill.name}
                        </button>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Transfer Information"
                    dataIndex="sts"
                    render={(vehicle, record) => {
                      return (
                        <button
                          onClick={() => {
                            setTransfer(record);
                            setViewInfo(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          Details
                        </button>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Vehicle Status"
                    dataIndex="sts"
                    sorter={(a, b) => a.status.id - b.status.id}
                    render={(sts, record) => (
                      <div
                        className={`rounded-full px-2 py-1 text-center text-sm text-white ${getStatusColor(record.status.id)}`}
                      >
                        {record.status.desc}
                      </div>
                    )}
                  ></Column>
                  <Column
                    title="Allocated Oil (L)"
                    dataIndex="oil"
                    sorter={(a, b) => a.oil - b.oil}
                  ></Column>
                  {globalState.user?.role.permissions.includes(
                    "update_transfer_landfill",
                  ) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) =>
                        record.status.id === 1 ? (
                          <div className="flex items-center gap-x-4">
                            <button
                              onClick={() => {
                                setOpenArrival(true);
                                setTransfer(record);
                              }}
                              className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                            >
                              Set Arrived at Landfill
                            </button>
                          </div>
                        ) : record.status.id === 2 ? (
                          <div className="flex items-center gap-x-4">
                            <button
                              onClick={() => {
                                setDepartedFromLandfill(record.id);
                                setTransfer(record);
                              }}
                              className="w-fit rounded-md border border-orange-500 px-2 py-1 text-orange-500 transition-all duration-300 hover:bg-orange-500 hover:text-white"
                            >
                              Set Departed from Landfill
                            </button>
                          </div>
                        ) : record.status.id === 4 ? (
                          <PdfGenerator data={record} />
                        ) : (
                          <div></div>
                        )
                      }
                    ></Column>
                  )}
                </Table>
                <Modal
                  title="Assigned Vehicle"
                  open={viewVehicle}
                  onOk={() => setViewVehicle(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 grid grid-cols-2 gap-y-4 lg:mx-4 lg:my-8">
                    {Object.entries(assignedVehicle).map(([key, value]) => {
                      return (
                        <div key={key} className="flex flex-col">
                          <p className="text-sm font-semibold text-xgray">
                            {key
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                          </p>
                          <p className="text-xdark">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </Modal>
                <Modal
                  title="Associated STS"
                  open={viewSTS}
                  onOk={() => setViewSTS(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 grid grid-cols-2 gap-y-4 lg:mx-4 lg:my-8">
                    {Object.entries(associatedSTS).map(([key, value]) => {
                      return (
                        <div key={key} className="flex flex-col">
                          <p className="text-sm font-semibold text-xgray">
                            {key
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                          </p>
                          <p className="text-xdark">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </Modal>
                <Modal
                  title="Associated Landfill"
                  open={viewLandfill}
                  onOk={() => setViewLandfill(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 grid grid-cols-2 gap-y-4 lg:mx-4 lg:my-8">
                    {Object.entries(associatedLandfill).map(([key, value]) => {
                      return (
                        <div key={key} className="flex flex-col">
                          <p className="text-sm font-semibold text-xgray">
                            {key
                              .split("_")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1),
                              )
                              .join(" ")}
                          </p>
                          <p className="text-xdark">{value}</p>
                        </div>
                      );
                    })}
                  </div>
                </Modal>
                <Modal
                  title="Enter received weight"
                  open={openArrival}
                  onOk={setArrivedAtLandfill}
                  onCancel={() => setOpenArrival(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="number"
                      min={0}
                      max={transfer.sts_departure_weight}
                      placeholder={`Weight (max: ${
                        transfer.sts_departure_weight
                          ? transfer.sts_departure_weight
                          : 0
                      })`}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      value={weight}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const maxValue = transfer.sts_departure_weight;

                        if (
                          inputValue === "" ||
                          (inputValue >= 0 && inputValue <= maxValue)
                        ) {
                          setWeight(inputValue);
                        }
                      }}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Transfer Information"
                  open={viewInfo}
                  onOk={() => setViewInfo(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 grid grid-cols-2 gap-y-4 lg:mx-4 lg:my-8">
                    {Object.entries(transfer)
                      .filter(([key]) =>
                        [
                          "sts_arrival_time",
                          "sts_departure_time",
                          "sts_departure_weight",
                          "landfill_arrival_time",
                          "landfill_departure_time",
                          "landfill_arrival_weight",
                        ].includes(key),
                      )
                      .map(([key, value]) => {
                        return (
                          <div key={key} className="flex flex-col">
                            <p className="text-sm font-semibold text-xgray">
                              {key
                                .split("_")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1),
                                )
                                .join(" ")}
                            </p>
                            <p className="text-xdark">
                              {key.includes("time")
                                ? convertUTC(value)
                                : value
                                  ? value
                                  : "N/A"}
                            </p>
                          </div>
                        );
                      })}
                  </div>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default TransferLandfill;
