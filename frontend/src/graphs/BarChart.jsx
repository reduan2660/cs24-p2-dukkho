/* eslint-disable react/prop-types */
import { useState } from "react";
import { Bar } from "@visx/shape";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";

const CustomBarChart = ({
  data,
  chartTitle,
  width,
  height,
  margin,
  fill,
  stroke,
}) => {
  const {
    tooltipOpen,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    hideTooltip,
    showTooltip,
  } = useTooltip();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
  });
  const tooltipStyles = {
    ...defaultStyles,
    minWidth: 60,
    maxWidth: 200,
    backgroundColor: "#E2E8F0",
    color: "black",
  };
  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom - 20;

  const xScale = scaleBand({
    domain: data.map((d) => d.alias),
    range: [0, xMax],
    padding: 0.3,
  });
  const yMin = 0;
  const yMaxi = Math.max(...data.map((d) => d.value));

  const yScale = scaleLinear({
    domain: [yMin, yMaxi],
    range: [height - margin.bottom - 20, margin.top],
  });

  const tickValues = yScale.ticks(5).filter((v) => v !== 0);

  return (
    <>
      <div className="h-70 flex items-center justify-center">
        <svg width={width} height={height + 20}>
          <rect
            x={margin.left}
            y={margin.top}
            width={xMax}
            height={yMax}
            fill="none"
          />
          {data.map((d) => (
            <Bar
              key={d.alias}
              x={margin.left + 10 + xScale(d.alias)}
              y={
                (d.value / yMaxi) * 100 > 10
                  ? margin.top + yScale(d.value)
                  : (d.value / yMaxi) * 100 == 0
                    ? yMax - margin.top
                    : yMax -
                      margin.top +
                      10 -
                      Math.ceil((d.value / yMaxi) * 100)
              }
              height={
                (d.value / yMaxi) * 100 > 10
                  ? yMax - yScale(d.value)
                  : (d.value / yMaxi) * 100 == 0
                    ? 0
                    : Math.ceil((d.value / yMaxi) * 100)
              }
              width={xScale.bandwidth()}
              fill={fill ? fill : "#CBD5E1"}
              stroke={stroke ? stroke : "#CBD5D4"}
              onMouseLeave={() => {
                hideTooltip();
              }}
              onMouseMove={(event) => {
                // if (tooltipTimeout) clearTimeout(tooltipTimeout);
                const left = event.clientX + 10;
                const top = event.clientY;
                showTooltip({
                  tooltipData: d,
                  tooltipTop: top,
                  tooltipLeft: left,
                });
              }}
            />
          ))}
          {xScale.domain().map((d) => (
            <g key={d}>
              <text
                x={margin.left + 10 + xScale(d) + xScale.bandwidth() / 2}
                y={height - margin.bottom}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={12}
                opacity="0.8"
              >
                <tspan
                  x={margin.left + 10 + xScale(d) + xScale.bandwidth() / 2}
                  dy="-0.5em"
                  className="overflow-hidden whitespace-normal break-all"
                >
                  {d.toString().slice(0, 12)}
                </tspan>
                <tspan
                  x={margin.left + 10 + xScale(d) + xScale.bandwidth() / 2}
                  dy="1em"
                  className="overflow-hidden whitespace-normal break-all"
                >
                  {d.toString().length > 18
                    ? d.toString().slice(12, 18).concat("...")
                    : d.toString().length > 12
                      ? d.toString().slice(12, 18)
                      : ""}
                </tspan>
              </text>
            </g>
          ))}

          <g>
            {tickValues.map((tick, index) => (
              <text
                key={index}
                x={margin.left + 20}
                y={yScale(tick) + 15}
                textAnchor="end"
                color="#4F4F4F"
                opacity="0.8"
                dominantBaseline="middle"
                fontSize={12}
              >
                {tick < 1000
                  ? tick
                  : tick < 1000000
                    ? `${tick / 1000}K`
                    : `${tick / 1000000}M`}
              </text>
            ))}
          </g>

          {tooltipOpen && tooltipData && (
            <TooltipInPortal
              top={tooltipTop}
              left={tooltipLeft}
              style={tooltipStyles}
            >
              {tooltipData.alias.length > 18 && (
                <div>
                  <div className="overflow-hidden whitespace-normal break-all">
                    Name: {tooltipData.alias}
                  </div>
                  <br />
                </div>
              )}
              <div>Count: {tooltipData.value}</div>
            </TooltipInPortal>
          )}
        </svg>
      </div>
    </>
  );
};

const TitledBarChart = ({
  data,
  chartTitle,
  width,
  height,
  margin,
  fill,
  stroke,
}) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-xl font-bold">{chartTitle}</p>
      {data.filter((d) => d.value !== 0).length > 0 ? (
        <CustomBarChart
          data={data}
          width={width}
          height={height}
          chartTitle={chartTitle}
          margin={margin}
          fill={fill}
          stroke={stroke}
        />
      ) : (
        <div className={`pb-4 text-center`}>No data available yet</div>
      )}
    </div>
  );
};

export { CustomBarChart, TitledBarChart };
