import styled from "styled-components"

import AnimationLight from "utils/animation/chart-loading-light.gif"

export const LegendDiv = styled.div`
  text-align: center;
  margin-left: 16px;
  justify-content: center;
  padding-bottom: 4px;
  cursor: default;
  display: flex;
  flex-wrap: wrap;

  font-family: FKGrotesk-SemiMono;
  font-size: 11px;

  @media (max-width: 720px) {
    font-size: 9px;
  }
`

export const LegendText = styled.span`
  margin-right: 16px;
  margin-left: 8px;

  @media (max-width: 720px) {
    margin-right: 10px;
    margin-left: 4px;
  }
`

export const LegendContainer = styled.div`
  display: inline-flex;
  align-items: center;
  margin: 4px 0px;
`

export const NoDataDiv = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px;
  height: 420px;
  align-items: center;

  @media (max-width: 720px) {
    height: 250px;
  }
`

export const ChartImg = styled.img`
  width: 100px;
  height: 100px;

  @media (max-width: 720px) {
    width: 60px;
    height: 60px;
  }
`

export const ChartLoadingAnimation = () => {
  return (
    <NoDataDiv>
      <ChartImg src={AnimationLight} />
    </NoDataDiv>
  )
}
