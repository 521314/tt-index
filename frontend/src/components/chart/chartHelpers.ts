import { DataFormat } from "context/DataContext"

export const toComposition = (data: DataFormat) => {
  const projectData = data.map((d) => {
    const projectData = d.data.reduce(
      (acc, curr) => ({ ...acc, [curr.component]: curr.tokens * curr.price }),
      {}
    )

    return { day: d.day, label: d.label, ...projectData }
  })

  return projectData
}
