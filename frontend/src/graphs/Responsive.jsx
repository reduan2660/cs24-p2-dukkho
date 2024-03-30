import React from "react";

const Responsive = () => {
  return (
    <div className="app-graph">
      <ParentSize className="graph-container" debounceTime={10}>
        {({ width: visWidth, height: visHeight }) => (
          <Lines width={visWidth} height={visHeight} />
        )}
      </ParentSize>
    </div>
  );
};

export default Responsive;
