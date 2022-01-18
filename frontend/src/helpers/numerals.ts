import numeral from "numeral"

export const getLabelForPrice = (value?: number | null) => {
  if (!value) return "-"
  return "$" + getLabelForNumber(value)
}

export const getLabelForNumber = (value?: number | null) => {
  if (!value || value === -1) return "-"
  return numeral(value).format("0.00a")
}

export const getLabelForPercentage = (value: number, hasPrefill: boolean) => {
  // Handle situations where the change is too small, most likely due to missing data from last day.
  // TODO: this should be handled in the backend in the future.

  const prefill = value > 0 ? "+" : ""
  if (hasPrefill) {
    return prefill + numeral(value).format("0,0.00") + "%"
  }
  return numeral(value).format("0,0.00") + "%"
}

export const getLabelForChart = (value: number | null, label?: string) => {
  if (value === undefined) return "-"
  if (label === "ps" || label === "pe" || label === "ratio")
    return numeral(value).format("0.0a") + "x"
  return "$" + numeral(value).format("0.0a")
}

export const getLabelForTooltip = (value: number) => {
  return "$" + numeral(value).format("0,0.00")
}
