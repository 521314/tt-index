import { useData } from "context/DataContext"
type Props = { fill?: string; size?: string }

const SqaureIcon = (props: Props) => {
  const { fill, size } = props
  const { isMobile } = useData()
  const hasStroke = fill === "#FFFFFF" || fill === "white"

  const squareSize = isMobile ? "10" : "14"
  return (
    <svg
      width={size || squareSize}
      height={size || squareSize}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke={hasStroke ? "black" : undefined}
      strokeWidth={hasStroke ? "1" : undefined}
    >
      <rect
        width={size || squareSize}
        height={size || squareSize}
        fill={fill || "#80D4FF"}
      />
    </svg>
  )
}

export default SqaureIcon
