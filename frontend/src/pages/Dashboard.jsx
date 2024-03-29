import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SidePanel from "../components/SidePanel";
import Navbar from "../components/Navbar";
import api from "../api";
import { useGlobalState } from "../GlobalStateProvider";
import { useLocation } from "react-router-dom";
import { GiMineTruck } from "react-icons/gi";
import { FaTruckArrowRight, FaDumpster } from "react-icons/fa6";
import { BsBuildingsFill } from "react-icons/bs";
import CountItem from "../components/CountItem";
import { TitledBarChart } from "../graphs/BarChart";

const Dashboard = () => {
  const { state } = useLocation();
  const [profileLoading, setProfileLoading] = useState(false);
  const { globalState, setGlobalState } = useGlobalState();
  const [availableVehicle, setAvailableVehicle] = useState(null);
  const [vehicleTransfer, setVehicleTransfer] = useState(null);
  const [totalSTS, setTotalSTS] = useState(null);
  const [totalLandfill, setTotalLandfill] = useState(null);
  const [wasteLandfill, setWasteLandfill] = useState([]);
  const [wasteSTS, setWasteSTS] = useState([]);
  const [oilConsumption, setOilConsumption] = useState([]);
  const [totalTransfer, setTotalTransfer] = useState([]);

  //TODO: check roles and permissions

  const getAvailableVehicle = () => {
    api
      .get("/report/available_vehicles")
      .then((res) => {
        if (res.status === 200) {
          setAvailableVehicle(res.data.count);
        }
      })
      .catch((err) => {
        console.log(err.response.data?.message);
      });
  };

  const getVehicleTransfer = () => {
    api
      .get("/report/vehicles_in_transfer")
      .then((res) => {
        if (res.status === 200) {
          setVehicleTransfer(res.data.count);
        }
      })
      .catch((err) => {
        console.log(err.response.data?.message);
      });
  };

  const getTotalSTS = () => {
    api
      .get("/report/total_sts")
      .then((res) => {
        if (res.status === 200) {
          setTotalSTS(res.data.count);
        }
      })
      .catch((err) => {
        console.log(err.response.data?.message);
      });
  };

  const getTotalLandfill = () => {
    api
      .get("/report/total_landfill")
      .then((res) => {
        if (res.status === 200) {
          setTotalLandfill(res.data.count);
        }
      })
      .catch((err) => {
        console.log(err.response.data?.message);
      });
  };

  const getWasteLandfill = () => {
    api
      .get("/report/total_waste_transfer_by_landfill")
      .then((res) => {
        if (res.status === 200) {
          setWasteLandfill(res.data);
        }
      })
      .catch((err) => {
        console.log(err.response.data?.message);
      });
  };

  const getWasteSTS = () => {
    api
      .get("/report/total_waste_transfer_by_sts")
      .then((res) => {
        if (res.status === 200) {
          setWasteSTS(res.data);
        }
      })
      .catch((err) => {
        console.log(err.response.data?.message);
      });
  };

  const getOilConsumption = () => {
    api
      .get("/report/total_oil_consumption_by_sts")
      .then((res) => {
        if (res.status === 200) {
          setOilConsumption(res.data);
        }
      })
      .catch((err) => {
        console.log(err.response.data?.message);
      });
  };

  const getTotalTransfer = () => {
    api
      .get("/report/total_transfer")
      .then((res) => {
        if (res.status === 200) {
          setTotalTransfer(res.data);
        }
      })
      .catch((err) => {
        console.log(err.response.data?.message);
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
        toast.error(err.response.data?.message);
      })
      .finally(() => {
        setProfileLoading(false);
      });
  };

  useEffect(() => {
    if (state === "access_denied") {
      toast.error("Access Denied");
    }
    getProfile();
    getAvailableVehicle();
    getVehicleTransfer();
    getTotalSTS();
    getTotalLandfill();
    getWasteLandfill();
    getWasteSTS();
    getOilConsumption();
    getTotalTransfer();
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
            <div className="mx-2 mt-4 flex flex-col gap-y-2 lg:mx-16 lg:my-16 lg:gap-y-4">
              <div className="hidden text-lg font-light text-xgray lg:block lg:text-2xl">
                Dashboard
              </div>
              <hr className="hidden lg:block" />
              <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-0 lg:gap-x-8">
                <CountItem
                  count={availableVehicle}
                  icon={<GiMineTruck className="text-2xl text-xblue" />}
                />
                <CountItem
                  count={vehicleTransfer}
                  icon={<FaTruckArrowRight className="text-2xl text-xblue" />}
                />
                <CountItem
                  count={totalSTS}
                  icon={<BsBuildingsFill className="text-2xl text-xblue" />}
                />
                <CountItem
                  count={totalLandfill}
                  icon={<FaDumpster className="text-2xl text-xblue" />}
                />
              </div>
              <div className="grid grid-cols-1 gap-x-4 overflow-x-auto lg:grid-cols-2">
                <div className="-px-2 w-full rounded-lg border pt-4">
                  <TitledBarChart
                    chartTitle={"Waste Collected by Landfill"}
                    data={wasteLandfill.map((item) => {
                      return {
                        alias: item.date,
                        value: item.count,
                      };
                    })}
                    width={700}
                    height={400}
                    margin={{ left: 5, right: 5, top: 5, bottom: 5 }}
                    fill={"#3182CE"}
                    stroke={"#3182CE"}
                  />
                </div>
                <div className="-px-2 w-full rounded-lg border pt-4">
                  <TitledBarChart
                    chartTitle={"Waste Collected by STS"}
                    data={wasteSTS.map((item) => {
                      return {
                        alias: item.date,
                        value: item.count,
                      };
                    })}
                    width={700}
                    height={400}
                    margin={{ left: 5, right: 5, top: 5, bottom: 5 }}
                    fill={"#3182CE"}
                    stroke={"#3182CE"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 overflow-x-auto">
                <div className="-px-2 w-full rounded-lg border pt-4">
                  <TitledBarChart
                    chartTitle={"Oil Consumption by STS"}
                    data={oilConsumption.map((item) => {
                      return {
                        alias: item.date,
                        value: item.oil_consumption,
                      };
                    })}
                    width={700}
                    height={400}
                    margin={{ left: 5, right: 5, top: 5, bottom: 5 }}
                    fill={"#3182CE"}
                    stroke={"#3182CE"}
                  />
                </div>
                <div className="-px-2 w-full rounded-lg border pt-4">
                  <TitledBarChart
                    chartTitle={"Total Transfer by STS"}
                    data={totalTransfer.map((item) => {
                      return {
                        alias: item.date,
                        value: item.count,
                      };
                    })}
                    width={700}
                    height={400}
                    margin={{ left: 5, right: 5, top: 5, bottom: 5 }}
                    fill={"#3182CE"}
                    stroke={"#3182CE"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Dashboard;
