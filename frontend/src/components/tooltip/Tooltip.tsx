import * as React from "react"
import { useLayer, useHover, Arrow } from "react-laag"
import { motion, AnimatePresence } from "framer-motion"
import { tooltipTexts } from "constants/tooltip"
import styled from "styled-components"
import { useData } from "context/DataContext"

type Props = {
  children: string | React.ReactNode
  id?: string
  projectId?: string
  width?: string
}

const Tooltip = ({ children, projectId, id, width }: Props) => {
  const { isMobile } = useData()
  // We use `useHover()` to determine whether we should show the tooltip.
  // Notice how we're configuring a small delay on enter / leave.
  const [isOver, hoverProps] = useHover()

  // Tell `useLayer()` how we would like to position our tooltip
  const { triggerProps, layerProps, arrowProps, renderLayer } = useLayer({
    isOpen: isOver,
    auto: true,
    overflowContainer: true,
    placement: "top-center",
    triggerOffset: 10, // small gap between wrapped content and the tooltip
  })

  // when children equals text (string | number), we need to wrap it in an
  // extra span-element in order to attach props
  let trigger
  if (isReactText(children)) {
    trigger = (
      <span className="tooltip-text-wrapper" {...triggerProps} {...hoverProps}>
        {children}
      </span>
    )
  } else if (React.isValidElement(children)) {
    // In case of an react-element, we need to clone it in order to attach our own props
    trigger = React.cloneElement(children, {
      ...triggerProps,
      ...hoverProps,
    })
  }

  const getText = () => {
    if (!id) return
    let text
    if (projectId) {
      const projectTexts = tooltipTexts[projectId]
      if (typeof projectTexts === "object") {
        text = projectTexts[id]
      }
    }

    if (!text) {
      text = tooltipTexts[id]
    }

    return text
  }

  if (isMobile || getText() === undefined) return <>{children}</>

  // We're using framer-motion for our enter / exit animations.
  // This is why we need to wrap our actual tooltip inside `<AnimatePresence />`.
  // The only thing left is to describe which styles we would like to animate.
  return (
    <>
      {trigger}
      {renderLayer(
        <AnimatePresence>
          {isOver && (
            <StyledMotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              {...layerProps}
            >
              <Box width={width}>{getText()}</Box>
              <Arrow
                {...arrowProps}
                backgroundColor="#2a2a2a"
                borderColor={"#000000"}
                borderWidth={1}
                size={6}
              />
            </StyledMotionDiv>
          )}
        </AnimatePresence>
      )}
    </>
  )
}

export default Tooltip

function isReactText(children: React.ReactNode | string) {
  return ["string", "number"].includes(typeof children)
}

const Box = styled.div<{ width?: string }>`
  background-color: #2a2a2a;
  color: white;
  padding: 8px;
  max-width: ${(props) => props.width || "250px"};
`

const StyledMotionDiv = styled(motion.div)`
  z-index: 999;
  font-size: 13px;
`
