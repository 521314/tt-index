import { getLabelForPercentage, getLabelForPrice } from "helpers/numerals"
import styled from "styled-components"
import rebalancesJson from "data/rebalances.json"
import { months } from "helpers/date"
import { useState } from "react"
import { orderBy } from "lodash"
import { useData } from "context/DataContext"

const headerItems = [
  "Asset",
  "Allocation ($)",
  "Allocation (%)",
  "Rebalance (%)",
]

const ChartDetails = () => {
  const [length, setLength] = useState(3)

  const { data } = useData()
  const rebalances = Object.entries(rebalancesJson)
  if (!rebalances) return null

  const january: any = [
    data[0].day,
    {
      composition: data[0].data.map((d) => ({
        component: d.component,
        value: d.tokens * d.price,
        weight_post: d.weight,
      })),
      value_total: data[0].value,
      weight_post_total: 1,
    },
  ]

  return (
    <Container>
      {[january]
        .concat(rebalances)
        .reverse()
        .slice(0, length)
        .map((entry) => (
          <Wrapper key={entry[0]}>
            <Title>{`${
              entry[0] !== "2021-01-01" ? `Beginning of month` : `Initial`
            } allocation - ${
              months[new Date(entry[0]).getUTCMonth()].full
            }`}</Title>
            <Header>
              {entry[1].rebalance_abs_avg
                ? headerItems.map((item) => (
                    <HeaderItem key={item}>{item}</HeaderItem>
                  ))
                : headerItems
                    .slice(0, 3)
                    .map((item) => <HeaderItem key={item}>{item}</HeaderItem>)}
            </Header>
            <Contents>
              {orderBy(entry[1].composition, "weight_post", "desc").map(
                (item, i) => (
                  <DataItem key={i + 1} data={item} />
                )
              )}
              <Total
                value={entry[1].value_total}
                rebalance={entry[1].rebalance_abs_avg}
                allocation={entry[1].weight_post_total}
              />
            </Contents>
          </Wrapper>
        ))}
      {rebalances.length >= length ? (
        <ShowMore onClick={() => setLength((prev) => prev + 3)}>
          {"Show more"}
        </ShowMore>
      ) : (
        <ShowMore onClick={() => setLength(3)}>{"Show less"}</ShowMore>
      )}
    </Container>
  )
}

type RebalanceCompositionEntry = {
  component: string
  id: string
  weight_pre: number
  weight_post: number
  rebalance?: number
  value: number
}

const DataItem = ({ data }: { data: RebalanceCompositionEntry }) => {
  return (
    <ItemRow>
      <ItemLink
        href={`https://www.tokenterminal.com/terminal/projects/${data.id}?utm_source=index`}
        target="_blank"
      >
        {data.component}
      </ItemLink>
      <Item>{getLabelForPrice(data.value)}</Item>
      <Item>{getLabelForPercentage(data.weight_post * 100, false)}</Item>
      {data.rebalance && (
        <Item>{getLabelForPercentage(data.rebalance * 100, true)}</Item>
      )}
    </ItemRow>
  )
}

type TotalProps = { value: number; rebalance?: number; allocation: number }
const Total = (props: TotalProps) => {
  const { value, rebalance, allocation } = props
  return (
    <ItemRow>
      <TotalItem>{"Total"}</TotalItem>
      <TotalItem>{getLabelForPrice(value)}</TotalItem>
      <TotalItem>{getLabelForPercentage(allocation * 100, false)}</TotalItem>
      {rebalance && (
        <TotalItem>{`Avg. ${getLabelForPercentage(
          rebalance * 100,
          false
        )}`}</TotalItem>
      )}
    </ItemRow>
  )
}

export default ChartDetails

const ShowMore = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  cursor: pointer;
  font-weight: bold;
`

const Container = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  margin-top: 50px;

  @media (max-width: 720px) {
    font-size: 12px;
  }
`

const Wrapper = styled.div`
  margin-bottom: 50px;
`

const Title = styled.div`
  font-weight: bold;
  font-size: 16px;

  margin-bottom: 5px;

  @media (max-width: 720px) {
    font-size: 14px;
  }
`

const Header = styled.div`
  display: flex;
  flex-direction: row;

  font-weight: bold;
  border-bottom: 1px solid black;

  padding-bottom: 10px;
`

const HeaderItem = styled.div`
  flex: 1;
`

const Contents = styled.div`
  margin-top: 10px;
`

const ItemRow = styled.div`
  display: flex;
  color: inherit;
  flex-direction: row;
  padding-bottom: 3px;
  padding-top: 3px;
  &:hover {
    background-color: #f8f8f8;
  }

  &:last-of-type {
    &:hover {
      background-color: unset;
    }
  }
`
const Item = styled.div`
  flex: 1;
`

const ItemLink = styled.a`
  flex: 1;
  color: inherit;
  text-decoration: underline;
  text-decoration-color: #858585;
  text-decoration-thickness: 0.125em;
  text-underline-offset: 1.5px;
`

const TotalItem = styled(Item)`
  font-weight: bold;
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px solid black;
`
