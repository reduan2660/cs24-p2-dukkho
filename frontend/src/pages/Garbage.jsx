import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import { DatePicker, Modal, Table } from "antd";
import Column from "antd/es/table/Column";
import api from "../api";
import { Select } from "antd";
import { useGlobalState } from "../GlobalStateProvider";
import { useNavigate } from "react-router-dom";
import PdfGenerator from "../components/PDFGenerator";
import BillGenerator from "../components/BillGenerator";

const Garbage = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [plans, setPlans] = useState([]);
  const [createEmployee, setCreateEmployee] = useState("");
  const [createPlan, setCreatePlan] = useState("");
  const [collectedWeight, setCollectedWeight] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [garbageLoading, setGarbageLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [openCreate, setOpenCreate] = useState(false);
  const [openArrived, setOpenArrived] = useState(false);
  const [assignedEmployee, setAssignedEmployee] = useState({});
  const [associatedPlan, setAssociatedPlan] = useState({});
  const [garbageRecords, setGarbageRecords] = useState([]);
  const [viewEmployee, setViewEmployee] = useState(false);
  const [viewPlan, setViewPlan] = useState(false);
  const [openPDF, setOpenPDF] = useState(false);
  const [date, setDate] = useState("");
  const [bill, setBill] = useState({});

  const showModal = () => {
    setOpenCreate(true);
  };

  const getBill = (date) => {
    api
      .get(`/billi?from_date=${date}`)
      .then((res) => {
        if (res.status === 200) {
          setBill(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const convertUTC = (time) => {
    if (time === null) return "N/A";
    return new Date(time * 1000).toLocaleString();
  };

  function getStatusColor(statusId) {
    switch (statusId) {
      case 0:
        return "bg-yellow-500"; // Departed from collection_plan
      case 1:
        return "bg-blue-600"; // Arrived at landfill
      case 2:
        return "bg-green-500"; // Departed from landfill
      default:
        return "bg-gray-600"; // Default color if statusId is unknown
    }
  }

  const setArrivedAtSTS = () => {
    api
      .put(`/collection/${collectionId}`, {
        collected_weight: parseFloat(collectedWeight),
        vehicle: vehicle,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Arrived at STS successfully");
          getCollections();
          setOpenArrived(false);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const getEmployees = () => {
    api
      .get("/employee")
      .then((res) => {
        if (res.status === 200) {
          setEmployees(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const getPlans = () => {
    api
      .get("/plan")
      .then((res) => {
        if (res.status === 200) {
          setPlans(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const getCollections = () => {
    setGarbageLoading(true);
    api
      .get("/collection")
      .then((res) => {
        if (res.status === 200) {
          setGarbageRecords(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setGarbageLoading(false);
      });
  };

  const startCollection = () => {
    api
      .post(`/collection`, {
        collection_plan_id: createPlan,
        employee_id: createEmployee,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Collection started successfully");
          getCollections();
          setOpenCreate(false);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const setCollectionEnd = (collectionId) => {
    api
      .patch(`/collection/${collectionId}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Collection ended successfully");
          getCollections();
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
          if (!res.data.role.permissions.includes("view_collection"))
            navigate("/", { state: "access_denied" });
        }
        res.data?.role?.permissions.includes("view_collection") &&
          getCollections();
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (openCreate) {
      setCreateEmployee("");
    }
  }, [openCreate]);

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
                  All Garbage Collections
                </div>
                <div className="flex items-center gap-x-2">
                  <button
                    className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                    onClick={() => setOpenPDF(true)}
                  >
                    Generate Bill
                  </button>
                  {globalState.user?.role.permissions.includes(
                    "start_collection",
                  ) ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          showModal();
                        }}
                        className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                      >
                        Create Garbage Collection
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
              {/* <div className="flex items-center justify-end gap-x-2">
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
                    placeholder="Search Garbage Records"
                    className="w-[300px] rounded-md border border-[#DED2D9] px-2 py-1.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => {
                      const filteredGarbages = garbageRecords.filter(
                        (garbage) =>
                          searchOption === "employee"
                            ? garbage.employee.reg_no
                                .toString()
                                .toLowerCase()
                                .includes(searchValue.toLowerCase())
                            : searchOption === "collection_plan"
                              ? garbage.collection_plan.name
                                  .toString()
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase())
                              : garbage.landfill.name
                                  .toString()
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase()),
                      );
                      setGarbageRecords(filteredGarbages);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const filteredGarbages = garbageRecords.filter(
                          (garbage) =>
                            searchOption === "employee"
                              ? garbage.employee.reg_no
                                  .toString()
                                  .toLowerCase()
                                  .includes(searchValue.toLowerCase())
                              : searchOption === "collection_plan"
                                ? garbage.collection_plan.name
                                    .toString()
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase())
                                : garbage.landfill.name
                                    .toString()
                                    .toLowerCase()
                                    .includes(searchValue.toLowerCase()),
                        );
                        setGarbageRecords(filteredGarbages);
                      }
                    }}
                  />
                </Tooltip>
                <Select
                  value={searchOption}
                  className="h-12 w-[200px] py-1"
                  options={[
                    { value: "employee", label: "Search by Employee" },
                    { value: "collection_plan", label: "Search by Collection Plan" },
                    { value: "landfill", label: "Search by Landfill" },
                  ]}
                  onChange={setSearchOption}
                />
              </div> */}
              <div className="overflow-x-auto">
                <Table
                  loading={garbageLoading}
                  dataSource={garbageRecords}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "30"],
                  }}
                >
                  <Column
                    title="Garbage ID"
                    dataIndex="id"
                    sorter={(a, b) => a.id - b.id}
                  ></Column>
                  <Column
                    title="Assigned Employee"
                    dataIndex="employee"
                    render={(employee, record) => {
                      return (
                        <button
                          onClick={() => {
                            setAssignedEmployee(record.employee);
                            setViewEmployee(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          {record.employee.name}
                        </button>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Associated Plan"
                    dataIndex="collection_plan"
                    render={(employee, record) => {
                      return (
                        <button
                          onClick={() => {
                            setAssociatedPlan(record.collection_plan);
                            setViewPlan(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          {record.collection_plan.area_of_collection}
                        </button>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Status"
                    dataIndex="status"
                    sorter={(a, b) => a.status.localCompare(b.status)}
                    render={(status, record) => (
                      <div
                        className={`rounded-full px-2 py-1 text-center text-sm text-white ${getStatusColor(record.status)}`}
                      >
                        {record.status === 0
                          ? "Departed for STS"
                          : record.status === 1
                            ? "Arrived at STS"
                            : "Collection Ended"}
                      </div>
                    )}
                  ></Column>
                  <Column
                    title="To STS"
                    dataIndex="sts"
                    sorter={(a, b) => a.sts.localCompare(b.sts)}
                    render={(sts, record) => {
                      return <div>{record.sts.name}</div>;
                    }}
                  ></Column>
                  <Column
                    title="From Contractor"
                    dataIndex="contract"
                    sorter={(a, b) => a.contract.localCompare(b.contract)}
                    render={(contract, record) => {
                      return <div>{record.contract.name}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Collection Start Time"
                    dataIndex="collection_start_time"
                    sorter={(a, b) =>
                      a.collection_start_time.localCompare(
                        b.collection_start_time,
                      )
                    }
                    render={(start_time) => {
                      return <div>{convertUTC(start_time)}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Collection End Time"
                    dataIndex="collection_end_time"
                    sorter={(a, b) =>
                      a.collection_end_time.localCompare(b.collection_end_time)
                    }
                    render={(end_time) => {
                      return <div>{convertUTC(end_time)}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Collected Weight"
                    dataIndex="collected_weight"
                    sorter={(a, b) => a.collected_weight - b.collected_weight}
                  ></Column>
                  <Column
                    title="Associated Vehicle"
                    dataIndex="vehicle"
                    sorter={(a, b) => a.vehicle.localCompare(b.vehicle)}
                  ></Column>
                  {(globalState.user?.role.permissions.includes(
                    "arrived_collection",
                  ) ||
                    globalState.user?.role.permissions.includes(
                      "end_collection",
                    )) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) =>
                        record.status === 0 &&
                        globalState.user?.role.permissions.includes(
                          "arrived_collection",
                        ) ? (
                          <div className="flex items-center gap-x-4">
                            <button
                              onClick={() => {
                                setCollectionId(record.id);
                                setOpenArrived(true);
                              }}
                              className="w-fit rounded-md border border-blue-600 px-2 py-1 text-blue-600 transition-all duration-300 hover:bg-blue-600 hover:text-white"
                            >
                              Set Arrived at STS
                            </button>
                          </div>
                        ) : record.status === 1 &&
                          globalState.user?.role.permissions.includes(
                            "end_collection",
                          ) ? (
                          <div className="flex items-center gap-x-4">
                            <button
                              onClick={() => {
                                setCollectionEnd(record.id);
                              }}
                              className="w-fit rounded-md border border-green-600 px-2 py-1 text-green-600 transition-all duration-300 hover:bg-green-600 hover:text-white"
                            >
                              End Collection
                            </button>
                          </div>
                        ) : (
                          <div></div>
                        )
                      }
                    ></Column>
                  )}
                </Table>
                <Modal
                  title="Create New Garbage Collection"
                  open={openCreate}
                  onOk={startCollection}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <Select
                      placeholder="Assign Employee"
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={setCreateEmployee}
                      onClick={() => getEmployees()}
                      options={employees.map((employee) => {
                        return {
                          value: employee.id,
                          label: employee.name,
                        };
                      })}
                    />
                    <Select
                      placeholder="Assign Collection Plan"
                      className="w-full rounded-md focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={setCreatePlan}
                      onClick={() => getPlans()}
                      options={plans.map((plan) => {
                        return {
                          value: plan.id,
                          label: plan.area_of_collection,
                        };
                      })}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Set Arrived at STS"
                  open={openArrived}
                  onOk={setArrivedAtSTS}
                  onCancel={() => setOpenArrived(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Collected Weight"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCollectedWeight(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Vehicle"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setVehicle(e.target.value)}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Assigned Employee"
                  open={viewEmployee}
                  onOk={() => setViewEmployee(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 grid grid-cols-2 gap-y-4 lg:mx-4 lg:my-8">
                    {Object.entries(assignedEmployee).map(([key, value]) => {
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
                          <p className="text-xdark">{value ? value : "N/A"}</p>
                        </div>
                      );
                    })}
                  </div>
                </Modal>
                <Modal
                  title="Associated Plan"
                  open={viewPlan}
                  onOk={() => setViewPlan(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 grid grid-cols-2 gap-y-4 lg:mx-4 lg:my-8">
                    {Object.entries(associatedPlan).map(([key, value]) => {
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
                          <p className="text-xdark">{value ? value : "N/A"}</p>
                        </div>
                      );
                    })}
                  </div>
                </Modal>
                <Modal
                  title="Generate Bill"
                  open={openPDF}
                  onOk={() => setOpenPDF(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 gap-y-4 lg:mx-4 lg:my-8">
                    <DatePicker
                      className="w-full"
                      onChange={(date, dateString) => {
                        setDate(new Date(dateString).getTime() / 1000);
                        getBill(new Date(dateString).getTime() / 1000);
                      }}
                    />
                    <div className="mt-3 flex justify-center">
                      {date && <BillGenerator data={bill} date={date} />}
                    </div>
                  </div>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Garbage;
