import * as XLSX from "xlsx"

interface CrearExcelProps {
  nombreHoja: string
  nombreArchivo: string
  data: (string | number)[][]
}

export const crearExcel = (settings: CrearExcelProps) => {
  const { nombreHoja, nombreArchivo, data } = settings

  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(data)
  workbook.SheetNames.push(nombreHoja)
  workbook.Sheets[nombreHoja] = worksheet
  XLSX.writeFile(workbook, nombreArchivo)
}
