import styled from "styled-components"
import { getLabelForPercentage, getLabelForPrice } from "helpers/numerals"
import { TooltipProps } from "recharts"
import Square from "components/icons/Square"
import { orderBy, sumBy } from "lodash"

type ContentType = { project: string; price: number; fill: string }

const CompositionTooltip = ({ active, payload }: TooltipProps<any, any>) => {
  if (!active || !payload) return null

  const title =
    payload && payload[0] ? payload[0].payload.label : "Daily price for TTI"

  const content = orderBy(
    payload.map((p: any) => ({
      project: p.name,
      price: p.value,
      fill: p.fill,
    })),
    "price",
    "desc"
  )

  const sum = sumBy(content, "price")

  return (
    <Container>
      <Wrapper>
        <Title>{title}</Title>
        <Contents>
          <Item key="price">
            <ContentsTitle>
              <Label>{"Price"}</Label>
            </ContentsTitle>
            <Value key={"label"}>{getLabelForPrice(sum)}</Value>
          </Item>
        </Contents>
        <Projects>
          <ProjectsTitle>{"Allocation"}</ProjectsTitle>
          {content.map((d: ContentType) => (
            <ProjectItem key={d.project}>
              <ProjectText style={{ fontWeight: "bold", marginRight: "10px" }}>
                <Square fill={d.fill} size="8" /> {d.project}
              </ProjectText>
              <ProjectText>
                {getLabelForPercentage((d.price / sum) * 100, false)}
              </ProjectText>
            </ProjectItem>
          ))}
        </Projects>
      </Wrapper>
    </Container>
  )
}

export default CompositionTooltip

const Projects = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
`
const ProjectItem = styled.div`
  display: flex;
  justify-content: space-between;
`

export const Contents = styled.div`
  display: flex;
  padding: 10px 5px 5px;
  border-bottom: 1px solid rgb(133, 133, 133, 0.5);
`

export const Container = styled.div`
  display: flex;
  opacity: 1;
  border: 0.2px solid #c4c4c4;
  background: rgba(255, 255, 255, 0.9);
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

const ProjectsTitle = styled(Title)`
  border: unset;
  padding: unset;
  margin-bottom: 10px;
  font-size: 10px;
  text-transform: unset;
`

const ProjectText = styled.div`
  font-family: FKGrotesk-SemiMono;
  font-style: normal;
  font-weight: bolder;
  font-size: 8px;

  letter-spacing: 0.06em;
  text-transform: uppercase;

  margin-bottom: 5px;
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

export const Logo = styled.img`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: -3px;
`
