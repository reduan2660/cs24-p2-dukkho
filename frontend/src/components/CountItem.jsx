import React from "react";
import CountUp from "react-countup";

const CountItem = ({ count, icon }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border p-8">
      <div>
        <div className="text-sm text-xlightgray">Total Landfill</div>
        <div className="text-5xl font-black text-xdark">
          <CountUp end={count} duration={1} />
        </div>
      </div>
      <div className="w-fit rounded-full border border-xblue bg-blue-100 p-3">
        {icon}
      </div>
    </div>
  );
};

export default CountItem;
