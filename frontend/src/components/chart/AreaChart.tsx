import React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

import { getLabelForChart } from "helpers/numerals"
import Square from "../icons/Square"
import {
  LegendDiv,
  LegendContainer,
  LegendText,
  ChartLoadingAnimation,
} from "./ChartComponents"
import { chartMargin, colors } from "./chartUtils"
import { useData } from "context/DataContext"
import { uniq } from "lodash"
import CompositionTooltip from "./tooltips/CompositionTooltip"

const StackedAreaChart = (props: { data: any[] }) => {
  const { isMobile } = useData()

  const labelColor = "#000"

  const { data } = props
  const settings = uniq(data.flatMap(Object.keys)).filter(
    (k) => !["day", "label"].includes(k)
  )

  settings.sort((a, b) => data[data.length - 1][b] - data[data.length - 1][a])

  const getByLabel = (label: string | number) => {
    if (label === "marketCap" || label === "market_cap") return "Market cap"
    if (label === "gmv") return "GMV"
    if (label === "tvl") return "TVL"
    if (label === "revenueSupplySide") return "Supply-side revenue"
    if (label === "revenueProtocol") return "Protocol revenue"
    if (label === "revenue") return "Total revenue"
    return label
  }

  if (data.length === 0 || settings.length === 0) {
    return <ChartLoadingAnimation />
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={isMobile ? 250 : 500}>
        <AreaChart data={data} margin={chartMargin}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="2 0"
            stroke={"#eee"}
          />
          <XAxis
            tick={{
              fontSize: isMobile ? 9 : 12,
            }}
            dataKey="label"
          />
          <YAxis
            label={{
              angle: -90,
              value: "Price",
              offset: -17,
              position: "insideLeft",
              style: {
                fontSize: isMobile ? 9 : 12,
                fill: labelColor,
                textAnchor: "middle",
              },
            }}
            tick={{
              fontSize: isMobile ? 9 : 12,
            }}
            axisLine={false}
            tickFormatter={(tick) => getLabelForChart(tick)}
          />
          <Tooltip
            content={<CompositionTooltip />}
            cursor={{ fill: "transparent" }}
          />
          {settings.map((option, index) => (
            <Area
              key={option}
              stackId="1"
              dataKey={option}
              fill={colors[index % (colors.length - 1)].fill}
              stroke={colors[index % (colors.length - 1)].stroke}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <LegendDiv>
        {settings.map((option, index) => (
          <LegendContainer key={option}>
            <Square fill={colors[index % (colors.length - 1)].stroke} />
            <LegendText>{getByLabel(option)}</LegendText>
          </LegendContainer>
        ))}
      </LegendDiv>
    </>
  )
}

export default StackedAreaChart
