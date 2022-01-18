import { useData } from "context/DataContext"
import { useEffect, useState } from "react"
import styled from "styled-components"
import AreaChart from "./AreaChart"
import { toComposition } from "./chartHelpers"
import ChartDetails from "./ChartDetails"
import { ChartToggle } from "./ChartToggle"
import LineChart from "./LineChart"

const Chart = () => {
  const { data } = useData()
  const [isComposition, setIsComposition] = useState(false)
  const [showDPI, setShowDPI] = useState(false)
  const [DPIData, setDPIData] = useState<{ dpiValue: any; day: string }[]>([])
  useEffect(() => {
    const fetchDPI = async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/defipulse-index/market_chart?vs_currency=usd&days=max&interval=daily",
        { method: "get" }
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message)
      }

      return data.prices
    }

    fetchDPI()
      .then((d: [number, number][]) =>
        d
          .filter((entry: number[]) => entry[0] >= 1609459200000)
          .map((entry: any) => ({
            dpiValue: entry[1],
            day: new Date(entry[0]).toISOString().split("T")[0],
          }))
      )
      .then(setDPIData)
  }, [])

  return (
    <Container>
      <ChartTitle>{"Backtested performance"}</ChartTitle>
      <ChartToggle
        disabled={showDPI}
        label="Show as composition"
        onChange={setIsComposition}
      />
      <ChartToggle
        disabled={isComposition || DPIData.length === 0}
        label="Show DPI performance"
        onChange={setShowDPI}
      />
      {!isComposition && (
        <LineChart data={data} dpiData={DPIData} showDPI={showDPI} />
      )}
      {isComposition && <AreaChart data={toComposition(data)} />}
      <SmallText>
        {
          "* The results of this backtest are illustrative only and primarily aim to demonstrate the theoretical performance and composition of the TTI over a relatively short period, which includes periods of up/down trends and significant volatility in the crypto markets. The TTI backtesting was performed assuming the following: instantaneous rebalances on the first day of each month, no slippage, no trading or streaming fees — which we acknowledge do positively bias the TTI’s theoretical performance compared to the benchmarks."
        }
      </SmallText>
      <ChartDetails />
    </Container>
  )
}

export default Chart

const Container = styled.div`
  display: flex;
  flex-direction: column;

  align-items: center;
  padding: 80px 0px;

  width: 50%;
  margin: 0 auto;

  @media (max-width: 720px) {
    padding: 40px;
    width: calc(100% - 80px);
  }
`

const ChartTitle = styled.div`
  text-align: center;
  font-weight: bold;
  font-size: 30px;
  font-family: FKGrotesk;

  margin-bottom: 20px;

  @media (max-width: 720px) {
    font-size: 24px;
  }
`

const SmallText = styled.div`
  margin-top: 10px;

  font-weight: normal;

  font-style: italic;

  font-size: 11px;

  color: #858585;

  @media (max-width: 720px) {
    font-size: 11px;
  }

  ul {
    font-weight: normal;
    margin-left: 0px;
    margin-top: 0px;
  }
`
