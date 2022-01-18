import { isMobile } from "helpers/isMobile"

export const keysToNotInclude = [
  "label",
  "tooltipLabel",
  "category",
  "datetime",
]

export const chartMargin = isMobile
  ? { top: 20, right: 0, bottom: 10, left: 0 }
  : { top: 20, right: 25, bottom: 10, left: 25 }

export const colors = [
  { fill: "#6FECCE", stroke: "#63d4b8" },
  { fill: "#4d38ff", stroke: "#4432e6" },
  { fill: "#FF7AB2", stroke: "#e66e9e" },
  { fill: "#FEDF1D", stroke: "#e6ca19" },
  { fill: "#8C81FE", stroke: "#7e75e6" },
  { fill: "#C8A67B", stroke: "#ad926c" },
  { fill: "#BBBDBE", stroke: "#a2a4a6" },
  { fill: "#FA6523", stroke: "#e05a1f" },
  { fill: "#D0DE7D", stroke: "#b9c46e" },
  { fill: "#F37675", stroke: "#d96868" },
  { fill: "#FF0099", stroke: "#FF0099" },
  { fill: "#CACED0", stroke: "#CACED0" },
  { fill: "#EA7650", stroke: "#EA7650" },
  { fill: "#73E6FF", stroke: "#73E6FF" },
]

export const toPercent = (decimal: number, fixed = 0) =>
  `${(decimal * 100).toFixed(fixed)}%`
