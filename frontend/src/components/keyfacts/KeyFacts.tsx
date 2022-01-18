import styled from "styled-components"

type ItemType = { title: string; text: string }
const itemRow1 = [
  { title: "Administrator", text: "Index Coop" },
  { title: "Strategy", text: "Fundamentals-weighted" },
  { title: "Streaming fee", text: "xx.x%" },
  { title: "Launch date", text: "xx.xx.xxxx" },
]

const itemRow2 = [
  { title: "Ticker", text: "TTI" },
  { title: "Min. investment", text: "N/A" },
  { title: "Max. investment", text: "N/A" },
  { title: "Rebalancing", text: "Monthly" },
]

const KeyFacts = () => (
  <Container>
    <Wrapper>
      <Title>{"Key Facts"}</Title>
      <Contents>
        <Items>
          {itemRow1.map((i) => (
            <Fact key={i.title} data={i} />
          ))}
        </Items>
        <Items>
          {itemRow2.map((i) => (
            <Fact key={i.title} data={i} />
          ))}
        </Items>
      </Contents>
    </Wrapper>
  </Container>
)

const Fact = ({ data }: { data: ItemType }) => (
  <ItemRow>
    <Item style={{ fontWeight: "bold" }}>{data.title}</Item>
    <Item>{data.text}</Item>
  </ItemRow>
)
export default KeyFacts

const Container = styled.div`
  background: black;
  color: white;
  align-items: center;

  display: flex;
  justify-content: center;
  flex-direction: column;

  @media (max-width: 720px) {
    font-size: 12px;
  }
`

const Wrapper = styled.div`
  padding: 80px 0px;

  width: 50%;
  margin: 0 auto;

  @media (max-width: 720px) {
    padding: 40px;
    width: calc(100% - 80px);
  }
`

const Title = styled.div`
  font-weight: bold;
  font-size: 30px;
  text-align: center;

  @media (max-width: 720px) {
    font-size: 24px;
  }
`

const Contents = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin: 50px 0px;
  width: 100%;

  @media (max-width: 720px) {
    flex-direction: column;
    margin: 20px 0px;
    width: auto;
  }
`
const Items = styled.div`
  display: flex;
  flex-direction: column;

  width: 100%;

  &:first-of-type {
    margin-right: 50px;
  }
`

const ItemRow = styled.div`
  display: flex;
  flex-direction: row;
  border-bottom: 1px solid white;
  padding: 2px 5px;
  margin-bottom: 5px;

  @media (max-width: 720px) {
    width: 100%;
    margin-bottom: 10px;
  }
`

const Item = styled.div`
  flex: 1;
`
