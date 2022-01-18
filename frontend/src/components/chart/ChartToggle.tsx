import Toggle from "components/generic/Toggle"
import { useState } from "react"
export const ChartToggle = (props: {
  onChange: (val: boolean) => void
  disabled?: boolean
  label: string
}) => {
  const { onChange, label, disabled } = props
  const [isOn, setIsOn] = useState(false)
  const handleChange = () => {
    if (disabled) return
    onChange(!isOn)
    setIsOn(!isOn)
  }
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginLeft: "auto",
        marginBottom: "5px",
        opacity: disabled ? "0.5" : 1,
      }}
      title="Toggle chart type"
    >
      <span
        style={{
          marginRight: "10px",
          fontFamily: "FKGrotesk-SemiMono",
          fontSize: "11px",
        }}
      >
        {label}
      </span>
      <Toggle onClick={handleChange} checked={isOn} />
    </div>
  )
}
