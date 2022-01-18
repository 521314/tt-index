import styled from "styled-components"
import { getLabelForTooltip } from "helpers/numerals"
import { TooltipProps } from "recharts"
import Square from "components/icons/Square"

const DPITooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (!active || !payload || !payload[0]) return null

  const title = payload[0].payload.label

  const content: any = payload[0]

  return (
    <Container>
      <Wrapper>
        <Title>{title}</Title>
        <Contents>
          <Item key={"tti"}>
            <ContentsTitle>
              <Square fill={"#6FECCE"} size="10" />
              <Label>{"TTI Price *"}</Label>
            </ContentsTitle>
            <Value key={"label"}>
              {getLabelForTooltip(content.payload.value)}
            </Value>
          </Item>

          <Item key={"dpi"}>
            <ContentsTitle>
              <Square fill={"#8C81FE"} size="10" />
              <Label>{"DPI Price"}</Label>
            </ContentsTitle>
            <Value key={"label"}>
              {getLabelForTooltip(content.payload.dpiValue)}
            </Value>
          </Item>
        </Contents>
      </Wrapper>
    </Container>
  )
}

export default DPITooltip

export const Contents = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px 5px 5px;
  border-bottom: 1px solid rgb(133, 133, 133, 0.5);
`

export const Container = styled.div`
  display: flex;
  opacity: 0.9;
  border: 0.2px solid #c4c4c4;
  background: white;
  box-sizing: border-box;
  box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.25);
  border-radius: 4px;
`

export const Wrapper = styled.div`
  max-width: 580px;
`

export const Title = styled.div`
  font-family: FKGrotesk-SemiMono;
  font-style: normal;
  font-weight: bold;
  font-size: 8px;

  letter-spacing: 0.06em;
  text-transform: uppercase;

  padding: 12px 16px;

  border-bottom: 1px solid rgb(133, 133, 133, 0.9);
`

export const ProjectTitle = styled(Title)`
  font-size: 12px;
  text-transform: unset;
`

export const Item = styled.div`
  margin: 0px 8px 8px 8px;

  &:last-of-type {
    margin-bottom: 0px;
  }
`

export const ContentsTitle = styled.div`
  display: inline-flex;
  align-items: center;
  margin-bottom: 8px;
`

export const Label = styled.div`
  display: flex;
  align-items: center;
  margin-left: 4px;

  font-family: FKGrotesk;
  font-weight: 500;
  font-size: 10px;
  line-height: 100%;
`

export const Value = styled.div`
  font-weight: 900;
  font-size: 13px;
  line-height: 16px;
`
