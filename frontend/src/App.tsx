import Header from "components/header/Header"
import Chart from "components/chart/Chart"
import Methodology from "components/methodology/Methodology"
import styled from "styled-components"
import KeyFacts from "components/keyfacts/KeyFacts"
import { useData } from "context/DataContext"
import LogoLight from "utils/animation/logo-light.gif"

function App() {
  const { data, isMobile } = useData()

  if (!data || data.length === 0) {
    return (
      <Loading>
        <img
          style={{ height: isMobile ? "75px" : "250px" }}
          src={LogoLight}
          alt="Loading"
        />
      </Loading>
    )
  }
  return (
    <Container>
      <Header />
      <Chart />
      <KeyFacts />
      <Methodology />
    </Container>
  )
}

export default App

const Container = styled.div`
  font-family: FKGrotesk;
  font-size: 14px;
`

const Loading = styled.div`
  max-height: 100%;
  max-width: 100%;
  width: auto;
  height: auto;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  text-align: center;
  vertical-align: middle;
  display: flex;
  justify-content: center;
  align-items: center;
`
