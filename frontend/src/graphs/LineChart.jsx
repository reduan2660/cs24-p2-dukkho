/* eslint-disable react/prop-types */
import { useState } from "react";
import { Group } from "@visx/group";
import { LinePath } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { extent, max } from "d3-array";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";

const LineChart = ({ data, width, height, xKeys }) => {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip();
  const { TooltipInPortal, containerRef } = useTooltipInPortal({
    scroll: true,
  });
  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    maxWidth: 200,
    backgroundColor: "#E2E8F0",
    color: "black",
  };

  // scales
  const xScale = scaleBand({
    domain: data.map((d) => d[xKeys]),
    range: [0, width],
    padding: 0.2,
  });
  const yScale = scaleLinear({
    domain: [0, max(data, (d) => d.value)],
    range: [height, 0],
  });

  return (
    <div ref={containerRef} className="relative">
      <svg width={width} height={height}>
        <Group>
          <LinePath
            // curve="curveLinear"
            data={data}
            x={(d) => xScale(d[xKeys])}
            y={(d) => yScale(d.value)}
            stroke="#333"
            strokeWidth={2}
            shapeRendering="geometricPrecision"
            onMouseLeave={() => {
              hideTooltip();
            }}
            onMouseMove={(event) => {
              const left = event.clientX + 10;
              const top = event.clientY;
              showTooltip({
                tooltipData: {
                  x: xScale.invert(event.clientX),
                  y: yScale.invert(event.clientY),
                },
                tooltipTop: top,
                tooltipLeft: left,
              });
            }}
          />
        </Group>
      </svg>
      {tooltipOpen && tooltipData && (
        <TooltipInPortal
          top={tooltipTop}
          left={tooltipLeft}
          style={tooltipStyles}
        >
          <div>Date: {tooltipData.x}</div>
          <div>Value: {tooltipData.y.toFixed(2)}</div>
        </TooltipInPortal>
      )}
    </div>
  );
};

export default function CustomLineChart({
  data,
  width,
  height,
  chartTitle,
  xKeys,
}) {
  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="ml-8 text-xl font-bold">{chartTitle}</p>
      <LineChart data={data} width={width} height={height} xKeys={xKeys} />
    </div>
  );
}
