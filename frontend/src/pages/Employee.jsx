import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import { DatePicker, Modal, Table, Tooltip } from "antd";
import Column from "antd/es/table/Column";
import api from "../api";
import { Select } from "antd";
import { useGlobalState } from "../GlobalStateProvider";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const navigate = useNavigate();
  const [plan, setPlan] = useState([]);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createContact, setCreateContact] = useState("");
  const [createDateOfBirth, setCreateDateOfBirth] = useState("");
  const [createDateOfHire, setCreateDateOfHire] = useState("");
  const [createJobTitle, setCreateJobTitle] = useState("");
  const [createPayPerHour, setCreatePayPerHour] = useState("");
  const [createPlanId, setCreatePlanId] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateEmail, setUpdateEmail] = useState("");
  const [updateUsername, setUpdateUsername] = useState("");
  const [updateContact, setUpdateContact] = useState("");
  const [updateDateOfBirth, setUpdateDateOfBirth] = useState("");
  const [updateDateOfHire, setUpdateDateOfHire] = useState("");
  const [updateJobTitle, setUpdateJobTitle] = useState("");
  const [updatePayPerHour, setUpdatePayPerHour] = useState("");
  const [updatePlanId, setUpdatePlanId] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [updateEmployees, setUpdateEmployees] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchOption, setSearchOption] = useState("name");
  const [openAbsent, setOpenAbsent] = useState(false);
  const [employee, setEmployee] = useState("");
  const [openLeave, setOpenLeave] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState("");
  const [leaveEndDate, setLeaveEndDate] = useState("");
  const [absentDate, setAbsentDate] = useState("");
  const [openActivity, setOpenActivity] = useState(false);
  const [activity, setActivity] = useState([]);

  const showModal = () => {
    setOpenCreate(true);
  };

  const getPlans = () => {
    api
      .get("/plan")
      .then((res) => setPlan(res.data))
      .catch((err) => {
        toast.error(err.response.data?.message);
      });
  };

  const absent = () => {
    api
      .post("/activity/absent", {
        employee_id: parseInt(employee),
        day_of_absence: parseInt(absentDate),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Absent marked successfully");
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenAbsent(false);
      });
  };

  const leave = () => {
    api
      .post("/activity/leave", {
        employee_id: parseInt(employee),
        start_date: parseInt(leaveStartDate),
        end_date: parseInt(leaveEndDate),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Leave marked successfully");
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenLeave(false);
      });
  };

  const updateEmployeesInfo = () => {
    setConfirmLoading(true);
    api
      .put(`/employee/${updateEmployees.id}`, {
        name: updateName,
        email: updateEmail,
        username: updateUsername,
        contact: updateContact,
        date_of_birth: parseInt(updateDateOfBirth),
        date_of_hire: parseInt(updateDateOfHire),
        job_title: updateJobTitle,
        pay_per_hour: parseFloat(updatePayPerHour),
        plan_id: parseInt(updatePlanId),
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Employee updated successfully");
          getEmployees();
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

  const createEmployees = () => {
    setConfirmLoading(true);
    api
      .post("/employee", {
        name: createName,
        email: createEmail,
        password: createPassword,
        username: createUsername,
        contact: createContact,
        date_of_birth: parseInt(createDateOfBirth),
        date_of_hire: parseInt(createDateOfHire),
        job_title: createJobTitle,
        pay_per_hour: parseFloat(createPayPerHour),
        plan_id: parseInt(createPlanId),
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Employee created successfully");
          getEmployees();
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
    setUpdateEmployees({ id: id, name: name });
  };

  const deleteEmployees = () => {
    api
      .delete(`/employee/${updateEmployees.id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Employee deleted successfully");
          getEmployees();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const getEmployees = () => {
    setEmployeesLoading(true);
    api
      .get("/employee")
      .then((res) => {
        if (res.status === 200) {
          setEmployees(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setEmployeesLoading(false);
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
          if (!res.data.role.permissions.includes("list_employee"))
            navigate("/", { state: "access_denied" });
        }
        res.data?.role?.permissions.includes("list_employee") && getEmployees();
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
      getEmployees();
    }
  }, [searchValue]);

  useEffect(() => {
    if (openEdit) {
      setUpdateName(updateEmployees.name);
      setUpdateEmail(updateEmployees.email);
      setUpdateUsername(updateEmployees.username);
      setUpdateContact(updateEmployees.contact);
      setUpdateDateOfBirth(updateEmployees.date_of_birth);
      setUpdateDateOfHire(updateEmployees.date_of_hire);
      setUpdateJobTitle(updateEmployees.job_title);
      setUpdatePayPerHour(updateEmployees.pay_per_hour);
      setUpdatePlanId(updateEmployees.plan_id.id);
    }
    if (openCreate) {
      setCreateName("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateUsername("");
      setCreateContact("");
      setCreateDateOfBirth("");
      setCreateDateOfHire("");
      setCreateJobTitle("");
      setCreatePayPerHour("");
      setCreatePlanId("");
    }
  }, [openEdit, openCreate, updateEmployees]);

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
              <div className="mx-2 flex flex-wrap items-center gap-x-6 lg:justify-between lg:gap-x-0">
                <div className="w-fit text-lg font-light text-xlightgray lg:text-3xl">
                  All Employees
                </div>
                <div className="flex flex-row-reverse items-center gap-x-2">
                  {globalState.user?.role.permissions.includes(
                    "create_employee",
                  ) ? (
                    <div>
                      <button
                        type="button"
                        onClick={showModal}
                        className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                      >
                        Create Employees
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  {globalState.user?.role.permissions.includes(
                    "edit_employee",
                  ) ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenAbsent(true)}
                        className="rounded-md bg-xyellow px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-yellow-600 lg:rounded-lg lg:px-5 lg:py-2"
                      >
                        Manage Absent
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                  {globalState.user?.role.permissions.includes(
                    "edit_employee",
                  ) ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setOpenLeave(true)}
                        className="rounded-md bg-xred px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-red-600 lg:rounded-lg lg:px-5 lg:py-2"
                      >
                        Manage Leave
                      </button>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-x-2 lg:justify-end">
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
                    placeholder="Search Employees"
                    className="w-[200px] rounded-md border border-[#DED2D9] px-2 py-1.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue lg:w-[300px]"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => {
                      const filteredEmployees = employees.filter((employees) =>
                        employees[searchOption]
                          .toString()
                          .toLowerCase()
                          .includes(searchValue.toLowerCase()),
                      );
                      setEmployees(filteredEmployees);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const filteredEmployees = employees.filter(
                          (employees) =>
                            employees[searchOption]
                              .toString()
                              .toLowerCase()
                              .includes(searchValue.toLowerCase()),
                        );
                        setEmployees(filteredEmployees);
                      }
                    }}
                  />
                </Tooltip>
                <Select
                  value={searchOption}
                  className="h-12 w-[100px] py-1 lg:w-[200px]"
                  options={[
                    { label: "Name", value: "name" },
                    { label: "Email", value: "email" },
                    { label: "Username", value: "username" },
                    { label: "Contact", value: "contact" },
                    { label: "Date of Birth", value: "date_of_birth" },
                    { label: "Date of Hire", value: "date_of_hire" },
                    { label: "Job Title", value: "job_title" },
                    { label: "Pay per Hour", value: "pay_per_hour" },
                    { label: "Plan ID", value: "plan_id" },
                  ]}
                  onChange={setSearchOption}
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={employeesLoading}
                  dataSource={employees}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "30"],
                  }}
                >
                  <Column
                    title="Name"
                    dataIndex="name"
                    sorter={(a, b) => a.name.localeCompare(b.name)}
                  ></Column>
                  <Column
                    title="Email"
                    dataIndex="email"
                    sorter={(a, b) => a.email.localeCompare(b.email)}
                  ></Column>
                  <Column
                    title="Username"
                    dataIndex="username"
                    sorter={(a, b) => a.username.localeCompare(b.username)}
                  ></Column>
                  <Column
                    title="Contact"
                    dataIndex="contact"
                    sorter={(a, b) => a.contact.localeCompare(b.contact)}
                  ></Column>
                  <Column
                    title="Date of Birth"
                    dataIndex="date_of_birth"
                    render={(date) =>
                      new Date(date * 1000).toLocaleDateString()
                    }
                  ></Column>
                  <Column
                    title="Date of Hire"
                    dataIndex="date_of_hire"
                    render={(date) =>
                      new Date(date * 1000).toLocaleDateString()
                    }
                  ></Column>
                  <Column
                    title="Job Title"
                    dataIndex="job_title"
                    sorter={(a, b) => a.job_title.localeCompare(b.job_title)}
                  ></Column>
                  <Column
                    title="Pay per Hour"
                    dataIndex="pay_per_hour"
                    sorter={(a, b) => a.pay_per_hour - b.pay_per_hour}
                  ></Column>
                  <Column
                    title="Plan ID"
                    dataIndex="plan_id"
                    render={(plan, record) => {
                      return <div>{record.plan_id.name}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Status"
                    dataIndex="status"
                    sorter={(a, b) => a.status.localeCompare(b.status)}
                    render={(status, record) => {
                      return (
                        <div>
                          {record.activities[0]?.is_absent === 1
                            ? "Absent"
                            : record.activities[0]?.is_on_leave === 1
                              ? "On Leave"
                              : record.activities[0]?.logout === null
                                ? "On Duty"
                                : "Off Duty"}
                        </div>
                      );
                    }}
                  ></Column>
                  <Column
                    title="Activity"
                    dataIndex="activity"
                    render={(status, record) => {
                      return (
                        <button
                          onClick={() => {
                            setActivity(record.activities);
                            setOpenActivity(true);
                          }}
                          className="w-fit rounded-md border border-xblue px-2 py-1 text-xblue transition-all duration-300 hover:bg-xblue hover:text-white"
                        >
                          Activities
                        </button>
                      );
                    }}
                  ></Column>
                  {(globalState.user?.role.permissions.includes(
                    "edit_employee",
                  ) ||
                    globalState.user?.role.permissions.includes(
                      "delete_employee",
                    )) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          {globalState.user?.role.permissions.includes(
                            "edit_employee",
                          ) && (
                            <button
                              onClick={() => {
                                setUpdateEmployees(record);
                                setOpenEdit(true);
                              }}
                              className="rounded-md bg-xblue px-4 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                          {globalState.user?.role.permissions.includes(
                            "delete_employee",
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
                  title="Delete Employee"
                  open={openDelete}
                  onOk={deleteEmployees}
                  okText="Delete"
                  onCancel={() => setOpenDelete(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">
                      {updateEmployees.name}
                    </p>
                    ?
                  </div>
                </Modal>
                <Modal
                  title="Create Employee"
                  open={openCreate}
                  onOk={createEmployees}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <input
                      type="text"
                      placeholder="Name"
                      value={createName}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={createEmail}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateEmail(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={createPassword}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreatePassword(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      value={createUsername}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateUsername(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Contact"
                      value={createContact}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateContact(e.target.value)}
                    />
                    <DatePicker
                      onChange={(date, dateString) =>
                        setCreateDateOfBirth(
                          Math.floor(new Date(dateString).getTime() / 1000),
                        )
                      }
                      placeholder="Date of Birth"
                    />
                    <DatePicker
                      onChange={(date, dateString) =>
                        setCreateDateOfHire(
                          Math.floor(new Date(dateString).getTime() / 1000),
                        )
                      }
                      placeholder="Date of Hire"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={createJobTitle}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateJobTitle(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Pay per Hour"
                      value={createPayPerHour}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreatePayPerHour(e.target.value)}
                    />
                    <Select
                      value={createPlanId}
                      className="w-full"
                      options={plan.map((plan) => ({
                        label: plan.area_of_collection,
                        value: plan.id,
                      }))}
                      onChange={(value) => setCreatePlanId(value)}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Edit Employee Information"
                  open={openEdit}
                  onOk={updateEmployeesInfo}
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
                      onChange={(e) => setUpdateName(e.target.value)}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={updateEmail}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateEmail(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Username"
                      value={updateUsername}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateUsername(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Contact"
                      value={updateContact}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateContact(e.target.value)}
                    />
                    <DatePicker
                      onChange={(date, dateString) =>
                        setUpdateDateOfBirth(
                          Math.floor(new Date(dateString).getTime() / 1000),
                        )
                      }
                      placeholder="Date of Birth"
                    />
                    <DatePicker
                      onChange={(date, dateString) =>
                        setUpdateDateOfHire(
                          Math.floor(new Date(dateString).getTime() / 1000),
                        )
                      }
                      placeholder="Date of Hire"
                    />
                    <input
                      type="text"
                      placeholder="Job Title"
                      value={updateJobTitle}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateJobTitle(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Pay per Hour"
                      value={updatePayPerHour}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdatePayPerHour(e.target.value)}
                    />
                    <Select
                      value={updatePlanId}
                      className="w-full"
                      options={plan.map((plan) => ({
                        label: plan.area_of_collection,
                        value: plan.id,
                      }))}
                      onChange={(value) => setUpdatePlanId(value)}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Manage Absent"
                  open={openAbsent}
                  onOk={absent}
                  onCancel={() => setOpenAbsent(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <Select
                      className="w-full"
                      options={employees.map((employee) => ({
                        label: employee.id,
                        value: employee.name,
                      }))}
                      onChange={(value) => setEmployee(value)}
                    />
                    <DatePicker
                      onChange={(date, dateString) =>
                        setAbsentDate(
                          Math.floor(new Date(dateString).getTime() / 1000),
                        )
                      }
                      placeholder="Pick Date"
                    />
                  </div>
                </Modal>
                <Modal
                  title="Manage Leave"
                  open={openLeave}
                  onOk={leave}
                  onCancel={() => setOpenLeave(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4 flex flex-col gap-y-4 lg:mx-4 lg:my-8">
                    <Select
                      className="w-full"
                      options={employees.map((employee) => ({
                        label: employee.id,
                        value: employee.name,
                      }))}
                      onChange={(value) => setEmployee(value)}
                    />
                    <DatePicker
                      onChange={(date, dateString) =>
                        setLeaveStartDate(
                          Math.floor(new Date(dateString).getTime() / 1000),
                        )
                      }
                      placeholder="Start Date"
                    />
                    <DatePicker
                      onChange={(date, dateString) =>
                        setLeaveEndDate(
                          Math.floor(new Date(dateString).getTime() / 1000),
                        )
                      }
                      placeholder="End Date"
                    />
                  </div>
                </Modal>
                <Modal
                  title="Employee Activity"
                  open={openActivity}
                  okButtonProps={{ hidden: true }}
                  onCancel={() => setOpenActivity(false)}
                  centered
                  width={800}
                >
                  {activity.length === 0 ? (
                    <div>No activities yet</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table
                        dataSource={activity}
                        rowKey="id"
                        style={{ overflowX: "auto" }}
                        pagination={{
                          defaultPageSize: 10,
                          showSizeChanger: true,
                          pageSizeOptions: ["10", "20", "30"],
                        }}
                      >
                        <Column title="Activity ID" dataIndex="id"></Column>
                        <Column
                          title="Date"
                          dataIndex="date"
                          render={(date) => {
                            return (
                              <div>
                                {date
                                  ? new Date(date * 1000).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            );
                          }}
                        ></Column>
                        <Column
                          title="Absent"
                          dataIndex="is_absent"
                          render={(is_absent) => {
                            return <div>{is_absent === 1 ? "Yes" : "No"}</div>;
                          }}
                        ></Column>
                        <Column
                          title="Leave"
                          dataIndex="is_on_leave"
                          render={(is_on_leave) => {
                            return (
                              <div>{is_on_leave === 1 ? "Yes" : "No"}</div>
                            );
                          }}
                        ></Column>
                        <Column
                          title="Logout"
                          dataIndex="logout"
                          render={(logout) => {
                            return (
                              <div>
                                {logout
                                  ? new Date(logout * 1000).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            );
                          }}
                        ></Column>
                        <Column
                          title="Login"
                          dataIndex="login"
                          render={(login) => {
                            return (
                              <div>
                                {login
                                  ? new Date(login * 1000).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            );
                          }}
                        ></Column>
                        <Column
                          title="Work Duration"
                          dataIndex="work_duration"
                        ></Column>
                        <Column title="Plan ID" dataIndex="plan"></Column>
                      </Table>
                    </div>
                  )}
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Employees;
