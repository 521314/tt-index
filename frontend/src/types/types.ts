export type CompositionEntry = {
  component: string
  id: string
  weight: number
  tokens: number
  price: number
  sp: number
}

export type BackTestingDayEntry = {
  value: number
  composition: CompositionEntry[]
}

export type BackTestingData = {
  [key: string]: BackTestingDayEntry
}
