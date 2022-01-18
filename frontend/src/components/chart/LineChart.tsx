import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts"

import { getLabelForChart } from "helpers/numerals"
import Square from "../icons/Square"
import { chartMargin } from "./chartUtils"
import { useData } from "context/DataContext"
import {
  ChartLoadingAnimation,
  LegendContainer,
  LegendDiv,
  LegendText,
} from "./ChartComponents"
import ChartTooltip from "./tooltips/ChartTooltip"
import { merge } from "lodash"
import DPITooltip from "./tooltips/DPITooltip"

const LineChartComponent = (props: {
  data: any[]
  dpiData: any[]
  showDPI: boolean
}) => {
  const { data, dpiData, showDPI } = props
  const { isMobile } = useData()

  let keys = ["value"]
  let finalData = [...data]
  if (data && dpiData && showDPI) {
    finalData = merge(finalData, dpiData).filter((e) => !!e.value)
    keys = ["value", "dpiValue"]
  }

  if (data.length === 0) {
    return <ChartLoadingAnimation />
  }

  return (
    <>
      <ResponsiveContainer height={isMobile ? 250 : 500}>
        <LineChart data={finalData} margin={chartMargin}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="2 0"
            stroke={"#eee"}
          />
          <XAxis
            tick={{
              fontSize: isMobile ? 9 : 12,
              fill: "unset",
            }}
            dataKey="label"
            allowDataOverflow={true}
          />
          <YAxis
            label={{
              angle: -90,
              value: "Price",
              position: "insideLeft",
              offset: -17,
              style: {
                fontSize: isMobile ? 9 : 12,
                fill: "#000",
                textAnchor: "middle",
              },
            }}
            tick={{
              fontSize: isMobile ? 9 : 12,
              fill: "unset",
            }}
            axisLine={false}
            tickFormatter={(tick) => getLabelForChart(tick, "price")}
          />
          <Tooltip
            cursor={false}
            content={keys.length === 1 ? <ChartTooltip /> : <DPITooltip />}
          />
          {keys.map((key, i) => (
            <Line
              key={key}
              activeDot={{
                fill: "white",
                stroke: i === 0 ? "#6FECCE" : "#8C81FE",
                strokeWidth: 2,
              }}
              dot={false}
              dataKey={key}
              strokeWidth="2"
              fill={i === 0 ? "#6FECCE" : "#8C81FE"}
              stroke={i === 0 ? "#6FECCE" : "#8C81FE"}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <LegendDiv>
        <LegendContainer key="price">
          <Square fill="#6FECCE" />
          <LegendText>{"Daily price for TTI *"}</LegendText>
        </LegendContainer>
        {showDPI && (
          <LegendContainer key="dpiPrice">
            <Square fill="#8C81FE" />
            <LegendText>{"Daily price for DPI"}</LegendText>
          </LegendContainer>
        )}
      </LegendDiv>
    </>
  )
}

export default LineChartComponent
