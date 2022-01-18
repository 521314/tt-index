import React, { useEffect, useState } from "react"
import dataJson from "data/data.json"
import { BackTestingData, CompositionEntry } from "types/types"
import { formatDate } from "helpers/date"

type DataContextType = {
  isMobile: boolean
  data: DataFormat
}

export type DataFormatEntry = {
  day: string
  label: string
  value: number
  data: CompositionEntry[]
}

export type DataFormat = DataFormatEntry[]

export const DataContext = React.createContext<DataContextType>({
  isMobile: false,
  data: [],
})

export const useData = () => React.useContext(DataContext)

export const DataProvider = ({ children }: any) => {
  const [isMobile, setIsMobile] = useState(false)
  const [data, setData] = useState<DataFormat>([])

  useEffect(() => {
    const formattedData = Object.entries(dataJson as BackTestingData).map(
      ([day, dailyData]) => ({
        day: day,
        label: formatDate(day),
        value: dailyData.value,
        data: dailyData.composition,
      })
    )
    setData(formattedData)
  }, [])

  const updateWidth = () => {
    if (!document.body) return

    const val = document.body.clientWidth <= 720

    if (isMobile !== val) setIsMobile(val)
  }
  // event listener for page resize so we know when to render mobile / desktop header
  useEffect(() => {
    updateWidth()

    window.addEventListener("resize", updateWidth)

    return () => {
      window.removeEventListener("resize", updateWidth)
    }
  })

  return (
    <DataContext.Provider
      value={{
        isMobile,
        data,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export default DataProvider
