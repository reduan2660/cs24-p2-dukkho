import { useEffect, useMemo, useState } from "react";
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

const Contractors = () => {
  const navigate = useNavigate();
  const [sts, setSts] = useState([]);
  const [createName, setCreateName] = useState("");
  const [createRegId, setCreateRegId] = useState("");
  const [createRegDate, setCreateRegDate] = useState("");
  const [createTin, setCreateTin] = useState("");
  const [createContact, setCreateContact] = useState("");
  const [createPayPerTon, setCreatePayPerTon] = useState("");
  const [createRequiredWasteTon, setCreateRequiredWasteTon] = useState("");
  const [createContractDuration, setCreateContractDuration] = useState("");
  const [createAreaOfCollection, setCreateAreaOfCollection] = useState("");
  const [createStsId, setCreateStsId] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [updateRegDate, setUpdateRegDate] = useState("");
  const [updateRegId, setUpdateRegId] = useState("");
  const [updateTin, setUpdateTin] = useState("");
  const [updateContact, setUpdateContact] = useState("");
  const [updatePayPerTon, setUpdatePayPerTon] = useState("");
  const [updateRequiredWasteTon, setUpdateRequiredWasteTon] = useState("");
  const [updateContractDuration, setUpdateContractDuration] = useState("");
  const [updateAreaOfCollection, setUpdateAreaOfCollection] = useState("");
  const [updateStsId, setUpdateStsId] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);
  const [contractorsLoading, setContractorsLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [updateContractors, setUpdateContractors] = useState({});
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAssignManager, setOpenAssignManager] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [assignedManagers, setAssignedManagers] = useState([]);
  const [selectedManagers, setSelectedManagers] = useState([]);
  const [usersByRole, setUsersByRole] = useState([]);
  const [unassignedUsers, setUnassignedUsers] = useState([]);
  const [managerIds, setManagerIds] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [searchValue, setSearchValue] = useState("");
  const [searchOption, setSearchOption] = useState("name");

  const showModal = () => {
    setOpenCreate(true);
  };

  const HandleCreateDate = (date, dateString) => {
    const RegDate = new Date(dateString);
    const epochTimeSeconds = Math.floor(RegDate.getTime() / 1000);
    setCreateRegDate(epochTimeSeconds);
  };

  const handleUpdateDate = (date, dateString) => {
    const RegDate = new Date(dateString);
    const epochTimeSeconds = Math.floor(RegDate.getTime() / 1000);
    setUpdateRegDate(epochTimeSeconds);
  };

  const assignManagers = () => {
    api
      .post(`/contract/manager`, {
        contractors_id: parseInt(updateContractors.id),
        user_id: managerIds,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Manager(s) assigned successfully");
          getContractors();
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
    setUpdateContractors({ id: id, name: name });
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

  const updateContractorsInfo = () => {
    setConfirmLoading(true);
    api
      .put(`/contract/${updateContractors.id}`, {
        name: updateName,
        reg_id: parseInt(updateRegId),
        reg_date: parseFloat(updateRegDate),
        tin: updateTin,
        contact: parseFloat(updateContact),
        pay_per_ton: parseFloat(updatePayPerTon),
        required_waste_ton: parseFloat(updateRequiredWasteTon),
        contract_duration: parseFloat(updateContractDuration),
        area_of_collection: updateAreaOfCollection,
        sts_id: updateStsId,
      })
      .then((res) => {
        if (res.status === 200) {
          toast.success("Contractor updated successfully");
          getContractors();
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

  const createContractors = () => {
    setConfirmLoading(true);
    api
      .post("/contract", {
        name: createName,
        reg_id: parseInt(createRegId),
        reg_date: parseFloat(createRegDate),
        tin: createTin,
        contact: parseFloat(createContact),
        pay_per_ton: parseFloat(createPayPerTon),
        required_waste_ton: parseFloat(createRequiredWasteTon),
        contract_duration: parseFloat(createContractDuration),
        area_of_collection: createAreaOfCollection,
        sts_id: createStsId,
      })
      .then((res) => {
        if (res.status === 201) {
          toast.success("Contractor created successfully");
          getContractors();
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
    setUpdateContractors({ id: id, name: name });
  };

  const deleteContractors = () => {
    api
      .delete(`/contract/${updateContractors.id}`)
      .then((res) => {
        if (res.status === 200) {
          toast.success("Contractor deleted successfully");
          getContractors();
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setOpenDelete(false);
      });
  };

  const getContractors = () => {
    setContractorsLoading(true);
    api
      .get("/contract")
      .then((res) => {
        if (res.status === 200) {
          setContractors(res.data);
        }
      })
      .catch((err) => {
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setContractorsLoading(false);
      });
  };

  const getSts = () => {
    api
      .get("/sts")
      .then((res) => {
        if (res.status === 200) {
          setSts(res.data);
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
          if (!res.data.role.permissions.includes("list_contract"))
            navigate("/", { state: "access_denied" });
        }
        res.data?.role?.permissions.includes("list_contract") &&
          getContractors();
        res.data?.role?.permissions.includes("list_all_sts") && getSts();
        res.data?.role?.permissions.includes("list_all_users") &&
          getUsersByRole([0, 2]);
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
      getContractors();
    }
  }, [searchValue]);

  useEffect(() => {
    if (openEdit) {
      setUpdateName(updateContractors.name);
      setUpdateRegId(updateContractors.reg_id);
      setUpdateRegDate(updateContractors.reg_date);
      setUpdateContact(updateContractors.contact);
      setUpdateTin(updateContractors.tin);
      setUpdateAreaOfCollection(updateContractors.area_of_collection);
      setUpdateContractDuration(updateContractors.contract_duration);
      setUpdatePayPerTon(updateContractors.pay_per_ton);
      setUpdateRequiredWasteTon(updateContractors.required_waste_ton);
      setUpdateStsId(updateContractors.sts.id);
    }
    if (openCreate) {
      setCreateName("");
      setCreateRegId("");
      setCreateRegDate("");
      setCreateContact("");
      setCreateAreaOfCollection("");
      setCreateContractDuration("");
      setCreatePayPerTon("");
      setCreateRequiredWasteTon("");
      setCreateStsId("");
    }
  }, [openEdit, openCreate, updateContractors]);

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
                  All Contractors
                </div>
                {globalState.user?.role.permissions.includes(
                  "create_contract",
                ) ? (
                  <div>
                    <button
                      type="button"
                      onClick={showModal}
                      className="rounded-md bg-xblue px-3 py-1 font-medium text-white transition-all duration-300 hover:bg-blue-600 lg:rounded-lg lg:px-5 lg:py-2"
                    >
                      Create Contractors
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
                    placeholder="Search Contractors"
                    className="w-[300px] rounded-md border border-[#DED2D9] px-2 py-1.5 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => {
                      const filteredContractors = contractors.filter(
                        (contractors) =>
                          contractors[searchOption]
                            .toString()
                            .toLowerCase()
                            .includes(searchValue.toLowerCase()),
                      );
                      setContractors(filteredContractors);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const filteredContractors = contractors.filter(
                          (contractors) =>
                            contractors[searchOption]
                              .toString()
                              .toLowerCase()
                              .includes(searchValue.toLowerCase()),
                        );
                        setContractors(filteredContractors);
                      }
                    }}
                  />
                </Tooltip>
                <Select
                  value={searchOption}
                  className="h-12 w-[200px] py-1"
                  options={[
                    {
                      value: "name",
                      label: "By Name",
                    },
                    {
                      value: "reg_id",
                      label: "By Reg Id",
                    },
                    {
                      value: "reg_date",
                      label: "By Reg Date",
                    },
                    {
                      value: "tin",
                      label: "By Tin",
                    },
                    {
                      value: "contact",
                      label: "By Contact",
                    },
                    {
                      value: "workforce_size",
                      label: "By Workforce Size",
                    },
                    {
                      value: "pay_per_ton",
                      label: "By Pay Per Ton",
                    },
                    {
                      value: "required_waste_ton",
                      label: "By Required Waste Ton",
                    },
                    {
                      value: "contract_duration",
                      label: "By Contract Duration",
                    },
                    {
                      value: "area_of_collection",
                      label: "By Area of Collection",
                    },
                  ]}
                  onChange={setSearchOption}
                />
              </div>
              <div className="overflow-x-auto">
                <Table
                  loading={contractorsLoading}
                  dataSource={contractors}
                  rowKey="id"
                  style={{ overflowX: "auto" }}
                  pagination={{
                    defaultPageSize: 10,
                    showSizeChanger: true,
                    pageSizeOptions: ["10", "20", "30"],
                  }}
                >
                  <Column
                    title="Contractor ID"
                    dataIndex="id"
                    sorter={(a, b) => a.id - b.id}
                  ></Column>
                  <Column
                    title="Assigned STS"
                    dataIndex="sts_id"
                    render={(sts, record) => {
                      return <div>{record.sts.name}</div>;
                    }}
                  ></Column>
                  <Column
                    title="Name"
                    dataIndex="name"
                    sorter={(a, b) => a.name.localeCompare(b.name)}
                  ></Column>
                  <Column
                    title="Reg Id"
                    dataIndex="reg_id"
                    sorter={(a, b) => a.reg_id - b.reg_id}
                  ></Column>
                  <Column
                    title="Reg Date"
                    dataIndex="reg_date"
                    sorter={(a, b) => a.reg_date - b.reg_date}
                    render={(date) => {
                      return (
                        <div>{new Date(date * 1000).toLocaleDateString()}</div>
                      );
                    }}
                  ></Column>
                  <Column title="Tin" dataIndex="tin"></Column>
                  <Column title="Contact Number" dataIndex="contact"></Column>
                  <Column
                    title="Workforce Size"
                    dataIndex="workforce_size"
                    sorter={(a, b) => a.workforce_size - b.workforce_size}
                  ></Column>
                  <Column
                    title="Pay Per Ton"
                    dataIndex="pay_per_ton"
                    sorter={(a, b) => a.pay_per_ton - b.pay_per_ton}
                  ></Column>
                  <Column
                    title="Required Waste Ton"
                    dataIndex="required_waste_ton"
                    sorter={(a, b) =>
                      a.required_waste_ton - b.required_waste_ton
                    }
                  ></Column>
                  <Column
                    title="Contract Duration"
                    dataIndex="contract_duration"
                    sorter={(a, b) => a.contract_duration - b.contract_duration}
                  ></Column>
                  <Column
                    title="Area of Collection"
                    dataIndex="area_of_collection"
                    sorter={(a, b) =>
                      a.area_of_collection.localeCompare(b.area_of_collection)
                    }
                  ></Column>
                  {globalState.user?.role.permissions.includes(
                    "create_contract",
                  ) && (
                    <Column
                      title="Managers"
                      dataIndex="managers"
                      render={(manager, record) => {
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
                    "edit_contract",
                  ) ||
                    globalState.user?.role.permissions.includes(
                      "delete_contract",
                    )) && (
                    <Column
                      title="Actions"
                      dataIndex="name"
                      render={(actions, record) => (
                        <div className="flex items-center gap-x-4">
                          {globalState.user?.role.permissions.includes(
                            "edit_contract",
                          ) && (
                            <button
                              onClick={() => {
                                setUpdateContractors(record);
                                setOpenEdit(true);
                              }}
                              className="rounded-md bg-xblue px-4 py-1 text-sm font-medium text-white transition-all duration-300 hover:bg-blue-600"
                            >
                              Edit
                            </button>
                          )}
                          {globalState.user?.role.permissions.includes(
                            "delete_contract",
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
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to assign managers(s) for{" "}
                    <p className="inline font-semibold">
                      {updateContractors.name}
                    </p>
                    ?
                  </div>
                </Modal>
                <Modal
                  title={`Assign Managers to Contractor`}
                  open={openAssignManager}
                  onOk={() => setOpenUpdate(true)}
                  okText="Save"
                  onCancel={() => {
                    setOpenAssignManager(false);
                    setSelectedManagers([]);
                  }}
                  closable={false}
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
                  title="Delete Contractor"
                  open={openDelete}
                  onOk={deleteContractors}
                  okText="Delete"
                  onCancel={() => setOpenDelete(false)}
                  closable={false}
                  centered
                >
                  <div className="mx-2 my-4">
                    Are you sure you want to delete{" "}
                    <p className="inline font-semibold">
                      {updateContractors.name}
                    </p>
                    ?
                  </div>
                </Modal>
                <Modal
                  title="Create Contractors"
                  open={openCreate}
                  onOk={createContractors}
                  confirmLoading={confirmLoading}
                  onCancel={() => setOpenCreate(false)}
                  closable={false}
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
                      placeholder="Reg Id"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateRegId(e.target.value)}
                    />
                    <DatePicker onChange={HandleCreateDate} />
                    <input
                      type="number"
                      placeholder="Reg Date"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateRegDate(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Tin"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateTin(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Contact"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreateContact(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Pay Per Ton"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setCreatePayPerTon(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Required Waste Ton"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) =>
                        setCreateRequiredWasteTon(e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Contract Duration"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) =>
                        setCreateContractDuration(e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Area of Collection"
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) =>
                        setCreateAreaOfCollection(e.target.value)
                      }
                    />
                    <Select
                      className="w-full"
                      placeholder="Assign STS"
                      options={sts.map((contractor) => ({
                        value: contractor.id,
                        label: contractor.name,
                      }))}
                      onChange={(value) => setCreateStsId(value)}
                    />
                  </div>
                </Modal>
                <Modal
                  title="Edit Contractors Information"
                  open={openEdit}
                  onOk={updateContractorsInfo}
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
                      type="number"
                      placeholder="Reg Id"
                      value={updateRegId}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateRegId(e.target.value)}
                    />
                    <DatePicker onChange={handleUpdateDate} />
                    <input
                      type="text"
                      placeholder="Tin"
                      value={updateTin}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateTin(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Contact"
                      value={updateContact}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdateContact(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Pay Per Ton"
                      value={updatePayPerTon}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) => setUpdatePayPerTon(e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Required Waste Ton"
                      value={updateRequiredWasteTon}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) =>
                        setUpdateRequiredWasteTon(e.target.value)
                      }
                    />
                    <input
                      type="number"
                      placeholder="Contract Duration"
                      value={updateContractDuration}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) =>
                        setUpdateContractDuration(e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="Area of Collection"
                      value={updateAreaOfCollection}
                      className="w-full rounded-md border border-[#DED2D9] px-2 py-1 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-xblue"
                      onChange={(e) =>
                        setUpdateAreaOfCollection(e.target.value)
                      }
                    />
                    <Select
                      value={updateStsId}
                      className="w-full"
                      placeholder="Assign STS"
                      options={sts.map((contractor) => ({
                        value: contractor.id,
                        label: contractor.name,
                      }))}
                      onChange={(value) => setUpdateStsId(value)}
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

export default Contractors;
