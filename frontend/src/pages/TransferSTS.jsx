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
import PdfGenerator from "../components/PDFGenerator";
import Gmap from "./Gmap";

const TransferSTS = () => {
  const navigate = useNavigate();
  const [createVehicle, setCreateVehicle] = useState("");
  const [createWeight, setCreateWeight] = useState("");
  const [createLandfill, setCreateLandfill] = useState("");
  const [createOil, setCreateOil] = useState("");
  const [calculatedOil, setCalculatedOil] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState([]);
  const [availableLandfills, setAvailableLandfills] = useState([]);
  const [assignedVehicle, setAssignedVehicle] = useState({});
  const [associatedSTS, setAssociatedSTS] = useState({});
  const [associatedLandfill, setAssociatedLandfill] = useState({});
  const [transferRecords, setTransferRecords] = useState([]);
  const [viewVehicle, setViewVehicle] = useState(false);
  const [viewSTS, setViewSTS] = useState(false);
  const [viewLandfill, setViewLandfill] = useState(false);
  const [transfer, setTransfer] = useState("");
  const [viewInfo, setViewInfo] = useState(false);
  const [openMap, setOpenMap] = useState(false);
  const [mySTS, setMySTS] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchOption, setSearchOption] = useState("vehicle");

  const showModal = () => {
    getAvailableVehicle();
    setOpenCreate(true);
  };

  const convertUTC = (time) => {
    return new Date(time).toLocaleString();
  };

  const getCalculatedOil = () => {
    api
      .post("/transfer/oil", {
        vehicle_id: createVehicle,
        landfill_id: createLandfill,
        weight: createWeight,
      })
      .then((res) => {
        setCalculatedOil(res.data.round_trip);
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

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

  const setArrivedAtSTS = (id) => {
    api
      .patch(`/transfer/sts/arrival/${id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Arrived at STS successfully");
          getTransfers();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const getAvailableVehicle = () => {
    api
      .get("/vehicle/available")
      .then((res) => {
        if (res.status === 200) {
          setAvailableVehicles(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const getAvailableLandfills = () => {
    api
      .get(`/landfill/available?weight=${createWeight}`)
      .then((res) => {
        if (res.status === 200) {
          setAvailableLandfills(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const getCalculatedOilReport = async (vehicleId, landfillId, weight) => {
    try {
      const response = await api.post("/transfer/oil", {
        vehicle_id: vehicleId,
        landfill_id: landfillId,
        weight: weight,
      });
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err.response.data?.message);
      return null;
    }
  };

  const createTransfer = () => {
    setConfirmLoading(true);
    api
      .post("/transfer/sts/departure", {
        vehicle_id: parseInt(createVehicle),
        landfill_id: parseInt(createLandfill),
        weight: parseFloat(createWeight),
        oil: calculatedOil
          ? parseFloat(calculatedOil).toFixed(2)
          : parseFloat(createOil),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Transfer Added successfully");
          getTransfers();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenCreate(false);
        setConfirmLoading(false);
        setCalculatedOil("");
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

  const getMysts = () => {
    api
      .get("/sts/my")
      .then((res) => {
        if (res.status === 200) {
          setMySTS(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
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
        res.data?.role?.permissions.includes("view_transfer") && getTransfers();
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (searchValue === "") getTransfers();
  }, [searchValue]);

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
                  All Transfer Records
                </div>
                {globalState.user?.role.permissions.includes(
                  "update_transfer_sts",
                ) ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        showModal();
                        getMysts();
                      }}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Create Transfer Record
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              <div className="flex items-center justify-end gap-x-2">
                <input
                  type="text"
                  placeholder="Search Transfer Records"
                  className="w-[300px] rounded-md border border-[#DED2D9] px-2 py-1.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={() => {
                    const filteredTransfers = transferRecords.filter(
                      (transfer) =>
                        searchOption === "vehicle"
                          ? transfer.vehicle.reg_no
                              .toString()
                              .toLowerCase()
                              .includes(searchValue.toLowerCase())
                          : searchOption === "sts"
                            ? transfer.sts.name
                                .toString()
                                .toLowerCase()
                                .includes(searchValue.toLowerCase())
                            : transfer.landfill.name
                                .toString()
                                .toLowerCase()
                                .includes(searchValue.toLowerCase()),
                    );
                    setTransferRecords(filteredTransfers);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const filteredTransfers = transferRecords.filter(
                        (transfer) =>
                          searchOption === "vehicle"
                            ? transfer.vehicle.reg_no
                                .toString()
                                .toLowerCase()
                                .includes(searchValue.toLowerCase())
                            : searchOption === "sts"
                              ? transfer.sts.name
                                  .toString()
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase())
                              : transfer.landfill.name
                                  .toString()
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase()),
                      );
                      setTransferRecords(filteredTransfers);
                    }
                  }}
                />
                <Select
                  value={searchOption}
                  className="h-12 w-[200px] py-1"
                  options={[
                    { value: "vehicle", label: "By Vehicle" },
                    { value: "sts", label: "By STS" },
                    { value: "landfill", label: "Landfill" },
                  ]}
                  onChange={setSearchOption}
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={transferLoading}
                  dataSource={transferRecords}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "30"],
                  }}
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
                    render={(oil, record) => {
                      return <div>{parseFloat(record.oil).toFixed(2)}</div>;
                    }}
                  ></Column>
                  {globalState.user?.role.permissions.includes(
                    "update_transfer_sts",
                  ) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) =>
                        record.status.id === 3 ? (
                          <div className="flex items-center gap-x-4">
                            <button
                              onClick={() => {
                                setArrivedAtSTS(record.id);
                                setTransfer(record);
                              }}
                              className="w-fit rounded-md border border-green-600 px-2 py-1 text-green-600 transition-all duration-300 hover:bg-green-600 hover:text-white"
                            >
                              Set Arrived at STS
                            </button>
                          </div>
                        ) : record.status.id === 4 ? (
                          <div>
                            <PdfGenerator
                              data={record}
                              oil={() =>
                                getCalculatedOilReport(0, 0, 20).then(
                                  (data) => {
                                    return data;
                                  },
                                )
                              }
                            />
                          </div>
                        ) : (
                          <div></div>
                        )
                      }
                    ></Column>
                  )}
                </Table>
                <Modal
                  title="Create New Transfer Record"
                  open={openCreate}
                  onOk={createTransfer}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <Select
                      placeholder="Assign Vehicle"
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={setCreateVehicle}
                      onClick={() => getAvailableVehicle()}
                      options={availableVehicles.map((vehicle) => {
                        return {
                          value: vehicle.id,
                          label: vehicle.reg_no,
                        };
                      })}
                    />
                    <input
                      type="number"
                      min={0}
                      max={
                        availableVehicles.find(
                          (vehicle) => vehicle.id === parseInt(createVehicle),
                        )?.capacity
                      }
                      placeholder={`Weight (max: ${
                        availableVehicles.find(
                          (vehicle) => vehicle.id === parseInt(createVehicle),
                        )?.capacity
                          ? availableVehicles.find(
                              (vehicle) =>
                                vehicle.id === parseInt(createVehicle),
                            )?.capacity
                          : 0
                      })`}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      value={createWeight}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        const maxValue = availableVehicles.find(
                          (vehicle) => vehicle.id === parseInt(createVehicle),
                        )?.capacity;

                        if (
                          inputValue === "" ||
                          (inputValue >= 0 && inputValue <= maxValue)
                        ) {
                          setCreateWeight(inputValue);
                        }
                      }}
                    />
                    <div className="flex items-center gap-x-2">
                      <Select
                        placeholder="Assign Landfill"
                        onClick={() => getAvailableLandfills(createWeight)}
                        className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                        onChange={setCreateLandfill}
                        options={availableLandfills.map((landfill) => {
                          return {
                            value: landfill.id,
                            label: landfill.name,
                          };
                        })}
                      />
                      <button
                        disabled={createLandfill === ""}
                        onClick={() => setOpenMap(true)}
                        className="min-w-fit rounded-md bg-xblue px-2 py-1 text-white transition-all duration-300 hover:bg-blue-600 disabled:bg-gray-200"
                      >
                        Get Routes
                      </button>
                    </div>

                    <div className="flex items-center gap-x-2">
                      <input
                        type="number"
                        placeholder="Allocate Oil"
                        value={
                          calculatedOil
                            ? parseFloat(calculatedOil).toFixed(2)
                            : createOil
                        }
                        onClick={() => getCalculatedOil()}
                        className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                        onChange={(e) => {
                          setCreateOil(e.target.value);
                          setCalculatedOil("");
                        }}
                      />
                      <button
                        disabled={
                          createWeight === "" ||
                          createLandfill === "" ||
                          createVehicle === ""
                        }
                        onClick={() => getCalculatedOil()}
                        className="min-w-fit rounded-md bg-xblue px-2 py-1 text-white transition-all duration-300 hover:bg-blue-600 disabled:bg-gray-200"
                      >
                        Use optimal oil
                      </button>
                    </div>
                  </div>
                </Modal>
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
                  title="Route Information"
                  open={openMap}
                  onOk={() => setOpenMap(false)}
                  width={1400}
                  height={900}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="items-cenetr flex justify-center">
                    <Gmap
                      height={800}
                      width={1300}
                      origin={{
                        lat: mySTS[0]?.latitude,
                        lng: mySTS[0]?.longitude,
                      }}
                      destination={{
                        lat: availableLandfills.find(
                          (item) => item.id === parseInt(createLandfill),
                        )?.latitude,
                        lng: availableLandfills.find(
                          (item) => item.id === parseInt(createLandfill),
                        )?.longitude,
                      }}
                      zoom={14}
                      travelMode="DRIVING"
                    />
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
                  title="Transfer Information"
                  open={viewInfo}
                  onOk={() => setViewInfo(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  centered
                  closable={false}
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

export default TransferSTS;
