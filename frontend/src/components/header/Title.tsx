import styled from "styled-components"
import Logo from "utils/logo/logo.svg"
import LogoSmall from "utils/logo/logo-compact.svg"
import { useData } from "context/DataContext"

const Title = () => {
  const { isMobile } = useData()

  return (
    <Container>
      <Wrapper>
        <Img src={isMobile ? LogoSmall : Logo} />
        <Text>{"Smart Beta Index Proposal"}</Text>
        {!isMobile && <Governance>{"Governance"}</Governance>}
      </Wrapper>
    </Container>
  )
}

export default Title

const Container = styled.div`
  display: flex;
  flex-direction: row;
  padding: 20px 0px;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  width: 100%;
  background: white;

  @media (max-width: 720px) {
    padding: 20px;
    width: calc(100% - 40px);
    font-size: 25px;
  }
`

const Wrapper = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
`

const Img = styled.img`
  height: 30px;

  @media (max-width: 720px) {
    height: 25px;
  }
`

const Text = styled.div`
  margin-top: 2px;
  margin-left: 25px;
  color: black;
`

const Governance = styled(Text)`
  margin-left: auto;
  color: #a3a5a8;
  font-size: 20px;
  border: 1px solid;
  padding: 5px 10px;
`
