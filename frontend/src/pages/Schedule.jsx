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
import { Select } from "antd";

const Schedule = () => {
  const navigate = useNavigate();
  const [scheduleType, setScheduleType] = useState("");
  const [selectedSchedule, setSelectedSchedule] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [schedule, setSchedule] = useState();

  const showModal = () => {
    setOpenCreate(true);
  };

  const generateSchedule = () => {
    setConfirmLoading(true);
    api
      .get(`/schedule/${scheduleType}`)
      .then((res) => {
        if (res.status === 200) {
          setSchedule(res.data);
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
          if (!res.data.role.permissions.includes("schedule"))
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

  const startCollection = (planId, employeeId) => {
    api
      .post(`/collection`, {
        collection_plan_id: planId,
        employee_id: employeeId,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Collection started successfully");
          setOpenCreate(false);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

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
                  All Schedule Plannings
                </div>
                {globalState.user?.role.permissions.includes("schedule") ? (
                  <div>
                    <button
                      type="button"
                      onClick={showModal}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Generate Schedule Planning
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
              {schedule && schedule?.collections.length > 0 && (
                <div className="text-xgray lg:text-center">
                  <div className="font-semibold">Minimum Cost: </div>
                  <div>{schedule?.min_cost}</div>
                </div>
              )}
              <div className="overflow-x-auto">
                <Table
                  loading={confirmLoading}
                  dataSource={schedule?.collections}
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
                    render={(vehicle, record) => {
                      return <div>{record.plan_id.area_of_collection}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Plan Details"
                    dataIndex="details"
                    render={(vehicle, record) => {
                      return (
                        <button
                          onClick={() => {
                            setSelectedSchedule(record.plan_id);
                            setOpenModal(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          {record.plan_id.area_of_collection}
                        </button>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Assignable Employee"
                    dataIndex="employee"
                    sorter={(a, b) => a.employee.localeCompare(b.employee)}
                    render={(vehicle, record) => {
                      return <div>{record.employee.name}</div>;
                    }}
                  ></Column>
                  {globalState.user?.role.permissions.includes(
                    "schedule",
                  ) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          <button
                            onClick={() => {
                              startCollection(
                                record.plan_id.id,
                                record.employee.id,
                              );
                            }}
                            className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                          >
                            Create Collection
                          </button>
                        </div>
                      )}
                    ></Column>
                  )}
                </Table>
                <Modal
                  title="Generate Schedule Planning"
                  open={openCreate}
                  onOk={generateSchedule}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <Select
                      className="w-full"
                      placeholder="Select Type"
                      options={[
                        {
                          label: "Cost",
                          value: "cost",
                        },
                        {
                          label: "Time",
                          value: "time",
                        },
                      ]}
                      onChange={setScheduleType}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Associated Landfill"
                  open={openModal}
                  onOk={() => setOpenModal(false)}
                  okText="Close"
                  cancelButtonProps={{ style: { display: "none" } }}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 grid grid-cols-2 gap-y-4 lg:mx-4 lg:my-8">
                    {Object.entries(selectedSchedule).map(([key, value]) => {
                      return (
                        <div key={key} className="flex flex-col">
                          <p className="text-sm font-semibold text-xgray">
                            {key === "contract"
                              ? "Contractor Name"
                              : key
                                  .split("_")
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1),
                                  )
                                  .join(" ")}
                          </p>
                          <p className="text-xdark">
                            {typeof value === "object" && value !== null
                              ? value.name
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

export default Schedule;
