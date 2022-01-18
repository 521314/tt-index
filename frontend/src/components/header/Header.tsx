import styled from "styled-components"
import Title from "./Title"
import PoweredBy from "utils/poweredBy.svg"
const Header = () => {
  return (
    <Container>
      <Title />
      <Wrapper>
        <Contents>
          <SubTitle>{"Smart beta"}</SubTitle>
          <Row>
            <Contents>
              <Text>
                {
                  "Smart beta indexes employ alternative index construction rules with the aim of improving a portfolio’s risk-adjusted returns. These indexes seek to combine the benefits of passive investing and the advantages of active investing strategies."
                }
              </Text>
              <Text>
                {
                  "Token Terminal smart beta index (TTI) uses a fundamentals-based ruleset for its index construction. Assets included in the TTI are chosen primarily based on their price to sales (P/S) ratio. The TTI is powered and managed by the Index Coop."
                }
              </Text>
            </Contents>
            <Right>
              <Img src={PoweredBy} />
            </Right>
          </Row>
        </Contents>
      </Wrapper>
    </Container>
  )
}

export default Header

const Img = styled.img`
  width: 300px;
  min-width: 300px;
  height: auto;

  max-width: -webkit-fill-available;
`

const Right = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 720px) {
    margin-top: 20px;
    justify-content: center;
  }
`
const Container = styled.div`
  color: white;
  background: black;

  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  @media (max-width: 720px) {
    font-size: 12px;
  }
`

const Row = styled.div`
  color: white;
  background: black;

  display: flex;
  justify-content: center;
  flex-direction: row;
  align-items: center;

  @media (max-width: 720px) {
    flex-direction: column;
  }
`

const Wrapper = styled.div`
  display: flex;
  padding: 80px 0px;
  width: 80%;

  @media (max-width: 720px) {
    padding: 40px;
    width: calc(100% - 80px);
    flex-direction: column;
  }
`

const SubTitle = styled.div`
  font-weight: bold;
  font-size: 30px;
  margin-bottom: 10px;

  text-align: left;

  @media (max-width: 720px) {
    font-size: 24px;
  }
`
const Contents = styled.div`
  background: black;

  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  row-gap: 10px;
`

const Text = styled.div`
  text-align: left;
  width: 80%;

  font-size: 14px;

  @media (max-width: 720px) {
    width: 100%;
  }
`
